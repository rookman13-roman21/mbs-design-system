#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.yclients.com/api/v1';
const ACCEPT = 'application/vnd.yclients.v2+json';
const PAGE_SIZE = 200;

const SOURCE_PROJECT = '/Users/romansuslin_1/Downloads/All_Code/YClients-Dashboard';
const ENV_FILE = path.join(SOURCE_PROJECT, '.env');
const REPORT_DIR = path.join(process.cwd(), 'reports');
const TARGET_SERVICE_ID = '19309167';
const TARGET_TITLE_RE = /mbs\s*mixology\s*cup/i;
const DATE_FROM = process.env.MBS_MIXOLOGY_DATE_FROM || '2024-01-01';
const DATE_TO = process.env.MBS_MIXOLOGY_DATE_TO || new Date().toISOString().slice(0, 10);

function parseEnv(file) {
  const result = {};
  const raw = fs.readFileSync(file, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function yclientsHeaders(env) {
  return {
    Accept: ACCEPT,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.YCLIENTS_PARTNER_TOKEN}, User ${env.YCLIENTS_USER_TOKEN}`
  };
}

function asArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function apiGet(pathname, params, env) {
  const url = new URL(`${API_BASE}${pathname}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, { headers: yclientsHeaders(env) });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
  }
  return response.json();
}

async function fetchPaged(pathname, params, env) {
  const all = [];
  for (let page = 1; ; page += 1) {
    const payload = await apiGet(pathname, { ...params, count: PAGE_SIZE, page }, env);
    const rows = asArray(payload);
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return all;
}

async function fetchActivityEvents(companyId, env) {
  try {
    const rows = await fetchPaged(`/activity/${companyId}/search`, {
      from: DATE_FROM,
      till: DATE_TO
    }, env);
    return rows
      .filter((item) => {
        const serviceId = String(item.service?.id || item.service_id || '');
        const title = [item.title, item.service?.title].filter(Boolean).join(' ');
        return serviceId === TARGET_SERVICE_ID || TARGET_TITLE_RE.test(title);
      })
      .map((item) => ({
        activityId: item.id,
        serviceId: String(item.service?.id || item.service_id || ''),
        title: item.title || item.service?.title || '',
        date: (item.date || item.datetime || '').slice(0, 10),
        time: item.time || (item.datetime || '').slice(11, 16) || '',
        capacity: Number(item.capacity || item.max_clients || 0),
        recordsCount: Number(item.records_count || item.booked || 0)
      }));
  } catch (error) {
    console.warn(`[warn] activity search failed: ${error.message}`);
    return [];
  }
}

async function fetchRecordsForRange(companyId, env) {
  return fetchPaged(`/records/${companyId}`, {
    start_date: DATE_FROM,
    end_date: DATE_TO
  }, env);
}

function isTargetRecord(record) {
  return (record.services || []).some((service) => {
    const serviceId = String(service.id || '');
    const title = String(service.title || '');
    return serviceId === TARGET_SERVICE_ID || TARGET_TITLE_RE.test(title);
  });
}

function eventKeyFromRecord(record, service) {
  const activityId = record.activity_id || record.activity?.id || '';
  if (activityId) return `activity:${activityId}`;
  return `service:${service.id || TARGET_SERVICE_ID}:${(record.date || record.datetime || '').slice(0, 10)}:${(record.datetime || '').slice(11, 16)}`;
}

function recordDateTime(record) {
  const date = (record.date || record.datetime || '').slice(0, 10);
  const time = (record.datetime || '').slice(11, 16);
  return { date, time };
}

function attendanceLabel(value) {
  if (value === 1) return 'visited';
  if (value === 2) return 'confirmed';
  if (value === -1) return 'no_show';
  if (value === -2) return 'canceled';
  if (value === 0) return 'pending';
  return String(value ?? '');
}

function clientName(client) {
  return client?.display_name || client?.name || '';
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r;]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows, columns) {
  const header = columns.map((column) => csvEscape(column.title)).join(';');
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column.key])).join(';'));
  return [header, ...body].join('\n') + '\n';
}

async function fetchClientRecords(companyId, clientId, env) {
  return fetchPaged(`/records/${companyId}`, {
    client_id: clientId
  }, env);
}

async function fetchClientCard(companyId, clientId, env) {
  try {
    const payload = await apiGet(`/client/${companyId}/${clientId}`, {}, env);
    return payload.data || payload || {};
  } catch {
    return {};
  }
}

function buildTargetEvents(activityEvents, targetRecords) {
  const events = new Map();
  for (const event of activityEvents) {
    events.set(`activity:${event.activityId}`, {
      activityId: event.activityId,
      serviceId: event.serviceId,
      title: event.title,
      date: event.date,
      time: event.time,
      capacity: event.capacity,
      recordsCount: event.recordsCount,
      recordIds: new Set(),
      clientIds: new Set()
    });
  }

  for (const record of targetRecords) {
    const service = (record.services || []).find((item) => String(item.id || '') === TARGET_SERVICE_ID || TARGET_TITLE_RE.test(String(item.title || ''))) || {};
    const key = eventKeyFromRecord(record, service);
    const { date, time } = recordDateTime(record);
    if (!events.has(key)) {
      events.set(key, {
        activityId: record.activity_id || record.activity?.id || '',
        serviceId: String(service.id || TARGET_SERVICE_ID),
        title: service.title || record.activity?.title || '',
        date,
        time,
        capacity: Number(record.activity?.capacity || service.capacity || service.max_count || 0),
        recordsCount: 0,
        recordIds: new Set(),
        clientIds: new Set()
      });
    }
    const event = events.get(key);
    event.recordIds.add(record.id);
    if (record.client?.id && !record.deleted) event.clientIds.add(String(record.client.id));
  }

  return [...events.values()]
    .map((event) => ({
      ...event,
      records: event.recordIds.size,
      clients: event.clientIds.size,
      recordIds: undefined,
      clientIds: undefined
    }))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function isActiveVisit(record) {
  if (!record || record.deleted) return false;
  if (record.attendance === -1 || record.attendance === -2) return false;
  return true;
}

function recordSortValue(record) {
  return record?.datetime || record?.date || '';
}

async function main() {
  if (!fs.existsSync(ENV_FILE)) throw new Error(`Не найден ${ENV_FILE}`);
  const env = parseEnv(ENV_FILE);
  const companyId = String(env.YCLIENTS_COMPANY_ID || '').trim();
  if (!env.YCLIENTS_PARTNER_TOKEN || !env.YCLIENTS_USER_TOKEN || !companyId) {
    throw new Error('Не заданы YCLIENTS_PARTNER_TOKEN / YCLIENTS_USER_TOKEN / YCLIENTS_COMPANY_ID');
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });

  console.log(`[info] range ${DATE_FROM}..${DATE_TO}, company ${companyId}, service ${TARGET_SERVICE_ID}`);
  const [activityEvents, rangeRecords] = await Promise.all([
    fetchActivityEvents(companyId, env),
    fetchRecordsForRange(companyId, env)
  ]);

  const targetRecords = rangeRecords.filter((record) => !record.deleted && isTargetRecord(record));
  const events = buildTargetEvents(activityEvents, targetRecords);

  const clientMap = new Map();
  for (const record of targetRecords) {
    const client = record.client || {};
    if (!client.id) continue;
    const clientId = String(client.id);
    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        id: clientId,
        name: clientName(client),
        phone: normalizePhone(client.phone),
        email: client.email || '',
        mixologyRecords: []
      });
    }
    const row = clientMap.get(clientId);
    const { date, time } = recordDateTime(record);
    const service = (record.services || []).find((item) => String(item.id || '') === TARGET_SERVICE_ID || TARGET_TITLE_RE.test(String(item.title || ''))) || {};
    row.mixologyRecords.push({
      recordId: record.id,
      activityId: record.activity_id || record.activity?.id || '',
      date,
      time,
      service: service.title || '',
      attendance: attendanceLabel(record.attendance),
      deleted: !!record.deleted
    });
  }

  const clientRows = [];
  let index = 0;
  for (const client of clientMap.values()) {
    index += 1;
    if (index % 10 === 0) console.log(`[info] enriched ${index}/${clientMap.size}`);
    const [clientRecords, card] = await Promise.all([
      fetchClientRecords(companyId, client.id, env),
      fetchClientCard(companyId, client.id, env)
    ]);

    const activeRecords = clientRecords.filter(isActiveVisit);
    const targetHistory = activeRecords.filter(isTargetRecord);
    const sortedActive = activeRecords
      .map((record) => ({ record, sort: recordSortValue(record) }))
      .sort((a, b) => a.sort.localeCompare(b.sort));
    const firstActive = sortedActive[0]?.record || null;
    const sortedTarget = targetHistory
      .map((record) => ({ record, sort: recordSortValue(record) }))
      .sort((a, b) => a.sort.localeCompare(b.sort));
    const firstTarget = sortedTarget[0]?.record || null;
    const firstTargetSort = recordSortValue(firstTarget);
    const priorActiveBeforeFirstCup = firstTargetSort
      ? activeRecords.filter((record) => recordSortValue(record) < firstTargetSort).length
      : 0;
    const firstTimeAtFirstCup = Boolean(firstTarget) && priorActiveBeforeFirstCup === 0;

    const activeMixologyDates = [...new Set(targetHistory.map((record) => {
      const { date } = recordDateTime(record);
      return date;
    }).filter(Boolean))].sort();

    clientRows.push({
      id: client.id,
      name: card.display_name || card.name || client.name,
      phone: normalizePhone(card.phone || client.phone),
      email: card.email || client.email,
      total_active_visits: activeRecords.length,
      mixology_active_visits: targetHistory.length,
      mixology_bookings_in_range: client.mixologyRecords.length,
      first_active_visit_date: firstActive ? recordDateTime(firstActive).date : '',
      first_active_visit_service: firstActive ? (firstActive.services || []).map((service) => service.title).filter(Boolean).join(', ') : '',
      first_cup_date: firstTarget ? recordDateTime(firstTarget).date : '',
      prior_active_visits_before_first_cup: priorActiveBeforeFirstCup,
      first_time_at_first_cup: firstTimeAtFirstCup ? 'yes' : 'no',
      community_segment: activeRecords.length >= 3
        ? '3_plus_visits'
        : firstTimeAtFirstCup
          ? 'first_time'
          : 'returning_2_visits',
      mixology_dates: activeMixologyDates.join(', '),
      mixology_records: client.mixologyRecords
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
        .map((record) => `${record.date} ${record.time} ${record.attendance}`.trim())
        .join(' | ')
    });
  }

  clientRows.sort((a, b) => {
    const bySegment = a.community_segment.localeCompare(b.community_segment);
    if (bySegment) return bySegment;
    return a.name.localeCompare(b.name, 'ru');
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceProject: SOURCE_PROJECT,
    companyId,
    targetServiceId: TARGET_SERVICE_ID,
    dateFrom: DATE_FROM,
    dateTo: DATE_TO,
    eventsCount: events.length,
    targetRecordsCount: targetRecords.length,
    uniqueClientsCount: clientRows.length,
    firstTimeCount: clientRows.filter((row) => row.first_time_at_first_cup === 'yes').length,
    returningTwoVisitsCount: clientRows.filter((row) => row.community_segment === 'returning_2_visits').length,
    threePlusVisitsCount: clientRows.filter((row) => row.community_segment === '3_plus_visits').length,
    events: events.map((event) => ({
      activityId: event.activityId,
      serviceId: event.serviceId,
      title: event.title,
      date: event.date,
      time: event.time,
      capacity: event.capacity,
      clients: event.clients,
      records: event.records,
      recordsCountFromActivity: event.recordsCount
    }))
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = path.join(REPORT_DIR, `mbs-mixology-cup-clients-${stamp}`);
  fs.writeFileSync(`${base}.summary.json`, JSON.stringify(summary, null, 2), 'utf8');
  fs.writeFileSync(`${base}.clients.json`, JSON.stringify(clientRows, null, 2), 'utf8');
  fs.writeFileSync(`${base}.clients.csv`, toCsv(clientRows, [
    { key: 'id', title: 'yClients ID' },
    { key: 'name', title: 'Имя' },
    { key: 'phone', title: 'Телефон' },
    { key: 'email', title: 'Email' },
    { key: 'community_segment', title: 'Сегмент' },
    { key: 'total_active_visits', title: 'Активных визитов всего' },
    { key: 'mixology_active_visits', title: 'Визитов MBS MIXOLOGY CUP' },
    { key: 'mixology_bookings_in_range', title: 'Записей MBS MIXOLOGY CUP в периоде' },
    { key: 'first_time_at_first_cup', title: 'Первый раз в школе на первом MBS MIXOLOGY CUP' },
    { key: 'prior_active_visits_before_first_cup', title: 'Активных визитов до первого MBS MIXOLOGY CUP' },
    { key: 'first_active_visit_date', title: 'Дата первого активного визита' },
    { key: 'first_active_visit_service', title: 'Первая услуга' },
    { key: 'first_cup_date', title: 'Дата первого MBS MIXOLOGY CUP' },
    { key: 'mixology_dates', title: 'Даты MBS MIXOLOGY CUP' },
    { key: 'mixology_records', title: 'Записи MBS MIXOLOGY CUP' }
  ]), 'utf8');

  console.log(JSON.stringify({
    ok: true,
    summary: {
      eventsCount: summary.eventsCount,
      targetRecordsCount: summary.targetRecordsCount,
      uniqueClientsCount: summary.uniqueClientsCount,
      firstTimeCount: summary.firstTimeCount,
      returningTwoVisitsCount: summary.returningTwoVisitsCount,
      threePlusVisitsCount: summary.threePlusVisitsCount
    },
    files: {
      summary: `${base}.summary.json`,
      clientsJson: `${base}.clients.json`,
      clientsCsv: `${base}.clients.csv`
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exit(1);
});
