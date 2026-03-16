// Shariah compliance screening data
// Based on standard criteria used by AAOIFI, Dow Jones Islamic Market Index, and MSCI Islamic Index
// Criteria:
//   - Business activity: no conventional banking/insurance, alcohol, tobacco, weapons, gambling, adult content, pork
//   - Financial ratios: total debt / market cap < 33%, interest income / revenue < 5%, cash + interest-bearing securities / market cap < 33%

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'doubtful' | 'unknown';

export interface ShariahInfo {
  status: ComplianceStatus;
  reason?: string;       // why non-compliant or doubtful
  screens?: string[];    // which screens it passes
}

const COMPLIANCE_DB: Record<string, ShariahInfo> = {
  // ── Tech / Compliant ──────────────────────────────────────────────────────
  AAPL:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  MSFT:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  GOOGL: { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  GOOG:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  NVDA:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  AMD:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  TSLA:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  META:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  AMZN:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  NFLX:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  INTC:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  QCOM:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  ADBE:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  CRM:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  ORCL:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SAP:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  UBER:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  LYFT:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SHOP:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SNOW:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  PLTR:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  NET:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  DDOG:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  ZM:    { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  TEAM:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  CRWD:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  PANW:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SPOT:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  PINS:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SNAP:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  TWLO:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SQ:    { status: 'doubtful',      reason: 'Block (SQ) offers interest-bearing BNPL products — financial ratio screens borderline' },
  PYPL:  { status: 'doubtful',      reason: 'PayPal earns interest on float and offers credit products — exceeds interest income threshold for some screens' },
  // ── Healthcare ────────────────────────────────────────────────────────────
  JNJ:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  PFE:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  MRK:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  ABBV:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  LLY:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  UNH:   { status: 'doubtful',      reason: 'UnitedHealth includes conventional insurance operations — insurance is generally non-compliant under AAOIFI' },
  CVS:   { status: 'doubtful',      reason: 'CVS includes Aetna conventional insurance — exceeds non-permissible income threshold' },
  // ── Industrials / Energy ──────────────────────────────────────────────────
  TSMC:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  TSM:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  XOM:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  CVX:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  BA:    { status: 'non_compliant', reason: 'Boeing derives significant revenue from military/defense weapons systems' },
  RTX:   { status: 'non_compliant', reason: 'Raytheon is a major defense/weapons contractor' },
  LMT:   { status: 'non_compliant', reason: 'Lockheed Martin is a major defense/weapons contractor' },
  NOC:   { status: 'non_compliant', reason: 'Northrop Grumman is a major defense/weapons contractor' },
  GD:    { status: 'non_compliant', reason: 'General Dynamics derives majority of revenue from weapons systems' },
  CAT:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  DE:    { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  HON:   { status: 'doubtful',      reason: 'Honeywell has defense/aerospace revenues — borderline on weapons screen depending on methodology' },
  GE:    { status: 'doubtful',      reason: 'GE Aerospace has significant defense revenues' },
  // ── Financials — Non-Compliant ────────────────────────────────────────────
  JPM:   { status: 'non_compliant', reason: 'Conventional bank — core business is interest-based lending and financial services' },
  BAC:   { status: 'non_compliant', reason: 'Conventional bank — core business is interest-based lending' },
  WFC:   { status: 'non_compliant', reason: 'Conventional bank — core business is interest-based lending' },
  GS:    { status: 'non_compliant', reason: 'Goldman Sachs — investment bank with interest income as primary revenue' },
  MS:    { status: 'non_compliant', reason: 'Morgan Stanley — investment bank with interest income as primary revenue' },
  C:     { status: 'non_compliant', reason: 'Citigroup — conventional bank with significant interest income' },
  AXP:   { status: 'non_compliant', reason: 'American Express — interest income from credit cards exceeds permissible threshold' },
  V:     { status: 'doubtful',      reason: 'Visa processes transactions but earns no interest — some scholars permit it; others flag facilitation of interest-bearing credit' },
  MA:    { status: 'doubtful',      reason: 'Mastercard — same as Visa, opinion varies by scholarly body' },
  BRK_B: { status: 'non_compliant', reason: 'Berkshire Hathaway holds significant conventional insurance and banking interests (GEICO, BofA stake)' },
  BLK:   { status: 'non_compliant', reason: 'BlackRock primarily manages interest-bearing fixed income products' },
  SCHW:  { status: 'non_compliant', reason: 'Charles Schwab — conventional brokerage with interest income exceeding threshold' },
  // ── Consumer / Retail ─────────────────────────────────────────────────────
  WMT:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  TGT:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  COST:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  NKE:   { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  SBUX:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
  MCD:   { status: 'non_compliant', reason: 'McDonald\'s serves pork products (items vary by region, but pork is a core menu item globally)' },
  YUM:   { status: 'non_compliant', reason: 'Yum Brands (KFC/Pizza Hut/Taco Bell) serves pork products' },
  // ── Alcohol / Tobacco — Non-Compliant ─────────────────────────────────────
  BUD:   { status: 'non_compliant', reason: 'Anheuser-Busch InBev — alcohol production is the core business' },
  TAP:   { status: 'non_compliant', reason: 'Molson Coors — alcohol production is the core business' },
  STZ:   { status: 'non_compliant', reason: 'Constellation Brands — alcohol (beer, wine, spirits) is the core business' },
  PM:    { status: 'non_compliant', reason: 'Philip Morris International — tobacco production is the core business' },
  MO:    { status: 'non_compliant', reason: 'Altria — tobacco production is the core business' },
  BTI:   { status: 'non_compliant', reason: 'British American Tobacco — tobacco production is the core business' },
  // ── Gambling ──────────────────────────────────────────────────────────────
  MGM:   { status: 'non_compliant', reason: 'MGM Resorts — casino and gambling operations' },
  LVS:   { status: 'non_compliant', reason: 'Las Vegas Sands — casino and gambling operations' },
  WYNN:  { status: 'non_compliant', reason: 'Wynn Resorts — casino and gambling operations' },
  DKNG:  { status: 'non_compliant', reason: 'DraftKings — sports betting and gambling platform' },
  // ── Media / Entertainment ─────────────────────────────────────────────────
  DIS:   { status: 'doubtful',      reason: 'Disney — generally compliant business but earns interest income through Disney+ subscription float and has moderate debt; some screens classify as doubtful' },
  PARA:  { status: 'non_compliant', reason: 'Paramount — owns CBS which has gambling advertising revenue and produces adult content' },
  // ── Real Estate ───────────────────────────────────────────────────────────
  SPG:   { status: 'non_compliant', reason: 'Simon Property Group REIT — interest-bearing debt ratio exceeds 33% threshold' },
  // ── Telecom ───────────────────────────────────────────────────────────────
  T:     { status: 'doubtful',      reason: 'AT&T — debt-to-market-cap ratio has historically exceeded 33% threshold; passes business activity screen' },
  VZ:    { status: 'doubtful',      reason: 'Verizon — high leverage; debt ratio borderline under strict screens' },
  TMUS:  { status: 'compliant',     screens: ['Business activity', 'Debt ratio', 'Interest income'] },
};

export function getShariahInfo(symbol: string): ShariahInfo {
  return COMPLIANCE_DB[symbol.toUpperCase()] ?? { status: 'unknown' };
}

export function isCompliant(symbol: string): boolean {
  return getShariahInfo(symbol).status === 'compliant';
}

export const STATUS_LABELS: Record<ComplianceStatus, string> = {
  compliant:     'Shariah Compliant',
  non_compliant: 'Non-Compliant',
  doubtful:      'Doubtful',
  unknown:       'Not Screened',
};

export const STATUS_COLORS: Record<ComplianceStatus, { color: string; bg: string; border: string }> = {
  compliant:     { color: '#00d4a0', bg: 'rgba(0,212,160,0.1)',  border: 'rgba(0,212,160,0.3)' },
  non_compliant: { color: '#ff4757', bg: 'rgba(255,71,87,0.1)',  border: 'rgba(255,71,87,0.3)' },
  doubtful:      { color: '#ffb347', bg: 'rgba(255,179,71,0.1)', border: 'rgba(255,179,71,0.3)' },
  unknown:       { color: '#5c7a9a', bg: 'rgba(92,122,154,0.1)', border: 'rgba(92,122,154,0.3)' },
};
