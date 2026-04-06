import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  BookOpen, ChevronRight, Zap, TrendingUp, DollarSign, ArrowRight,
  CheckCircle, XCircle, HelpCircle, Calculator, Lightbulb, FileText,
  Award, Link2, RotateCcw, Layers, Wallet, Building2, Cpu, Heart,
  ShoppingCart, Leaf
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */
const fmt = (n) => {
  if (n === undefined || n === null) return '—';
  const abs = Math.abs(n);
  const str = abs >= 1000 ? abs.toLocaleString() : abs.toString();
  return n < 0 ? `(${str})` : str;
};
const pctOf = (part, whole) => whole ? ((Math.abs(part) / whole) * 100).toFixed(1) + '%' : '—';
const yoyCalc = (curr, prev) => (prev && curr !== null && prev !== null) ? (((curr - prev) / Math.abs(prev)) * 100).toFixed(1) : null;

/* ════════════════════════════════════════════════════════════
   5 COMPANIES DATA
   ════════════════════════════════════════════════════════════ */

const COMPANIES = {
  nvtk: {
    name: 'NovaTech Inc.', ticker: 'NVTK', sector: 'Technology / SaaS',
    icon: Cpu, color: 'blue', desc: 'Enterprise cloud software company with high margins and strong recurring revenue.',
    is: [
      { id: 'revenue', label: 'Revenue', y24: 52400, y23: 44800, indent: 0, type: 'total' },
      { id: 'cogs', label: 'Cost of Revenue', y24: -21000, y23: -18400, indent: 1, type: 'expense' },
      { id: 'gross', label: 'Gross Profit', y24: 31400, y23: 26400, indent: 0, type: 'subtotal' },
      { id: 'rd', label: 'Research & Development', y24: -8200, y23: -7100, indent: 1, type: 'expense' },
      { id: 'sga', label: 'Selling, General & Admin', y24: -6800, y23: -6200, indent: 1, type: 'expense' },
      { id: 'opex', label: 'Total Operating Expenses', y24: -15000, y23: -13300, indent: 1, type: 'expense' },
      { id: 'opinc', label: 'Operating Income (EBIT)', y24: 16400, y23: 13100, indent: 0, type: 'subtotal' },
      { id: 'interest', label: 'Interest Expense', y24: -1200, y23: -1400, indent: 1, type: 'expense' },
      { id: 'other', label: 'Other Income', y24: 400, y23: 300, indent: 1, type: 'normal' },
      { id: 'pretax', label: 'Pre-Tax Income', y24: 15600, y23: 12000, indent: 0, type: 'subtotal' },
      { id: 'tax', label: 'Income Tax', y24: -3120, y23: -2400, indent: 1, type: 'expense' },
      { id: 'netinc', label: 'Net Income', y24: 12480, y23: 9600, indent: 0, type: 'total' },
    ],
    bs: [
      { id: 'bs_ha', label: 'ASSETS', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cash', label: 'Cash & Equivalents', y24: 15200, y23: 19320, indent: 1, type: 'normal' },
      { id: 'sti', label: 'Short-Term Investments', y24: 8400, y23: 6200, indent: 1, type: 'normal' },
      { id: 'ar', label: 'Accounts Receivable', y24: 7800, y23: 6400, indent: 1, type: 'normal' },
      { id: 'inv', label: 'Inventory', y24: 3200, y23: 2800, indent: 1, type: 'normal' },
      { id: 'tca', label: 'Total Current Assets', y24: 34600, y23: 34720, indent: 0, type: 'subtotal' },
      { id: 'ppe', label: 'Property, Plant & Equipment', y24: 12400, y23: 11400, indent: 1, type: 'normal' },
      { id: 'gw', label: 'Goodwill', y24: 8600, y23: 6600, indent: 1, type: 'normal' },
      { id: 'intang', label: 'Intangible Assets', y24: 5200, y23: 4400, indent: 1, type: 'normal' },
      { id: 'olta', label: 'Other Long-Term Assets', y24: 3800, y23: 3280, indent: 1, type: 'normal' },
      { id: 'ta', label: 'Total Assets', y24: 64600, y23: 60400, indent: 0, type: 'total' },
      { id: 'bs_hl', label: 'LIABILITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'ap', label: 'Accounts Payable', y24: 5400, y23: 4600, indent: 1, type: 'normal' },
      { id: 'std', label: 'Short-Term Debt', y24: 2800, y23: 3200, indent: 1, type: 'normal' },
      { id: 'accr', label: 'Accrued Liabilities', y24: 4200, y23: 3800, indent: 1, type: 'normal' },
      { id: 'tcl', label: 'Total Current Liabilities', y24: 12400, y23: 11600, indent: 0, type: 'subtotal' },
      { id: 'ltd', label: 'Long-Term Debt', y24: 14000, y23: 17000, indent: 1, type: 'normal' },
      { id: 'oltl', label: 'Other Long-Term Liabilities', y24: 3200, y23: 2800, indent: 1, type: 'normal' },
      { id: 'tl', label: 'Total Liabilities', y24: 29600, y23: 31400, indent: 0, type: 'subtotal' },
      { id: 'bs_he', label: 'SHAREHOLDERS\' EQUITY', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cs', label: 'Common Stock & APIC', y24: 5000, y23: 5000, indent: 1, type: 'normal' },
      { id: 're', label: 'Retained Earnings', y24: 28000, y23: 22000, indent: 1, type: 'normal' },
      { id: 'oeq', label: 'Treasury Stock & Other', y24: 2000, y23: 2000, indent: 1, type: 'normal' },
      { id: 'te', label: 'Total Equity', y24: 35000, y23: 29000, indent: 0, type: 'subtotal' },
      { id: 'tle', label: 'Total Liabilities & Equity', y24: 64600, y23: 60400, indent: 0, type: 'total' },
    ],
    cf: [
      { id: 'cf_ho', label: 'OPERATING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cf_ni', label: 'Net Income', y24: 12480, y23: 9600, indent: 1, type: 'normal' },
      { id: 'depr', label: 'Depreciation & Amortization', y24: 3200, y23: 2800, indent: 1, type: 'normal' },
      { id: 'sbc', label: 'Stock-Based Compensation', y24: 1800, y23: 1500, indent: 1, type: 'normal' },
      { id: 'wc', label: 'Changes in Working Capital', y24: -1400, y23: -800, indent: 1, type: 'normal' },
      { id: 'ocf', label: 'Operating Cash Flow', y24: 16080, y23: 13100, indent: 0, type: 'subtotal' },
      { id: 'cf_hi', label: 'INVESTING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'capex', label: 'Capital Expenditures', y24: -4200, y23: -3600, indent: 1, type: 'normal' },
      { id: 'acq', label: 'Acquisitions', y24: -2000, y23: 0, indent: 1, type: 'normal' },
      { id: 'invp', label: 'Investment Purchases', y24: -3600, y23: -2400, indent: 1, type: 'normal' },
      { id: 'icf', label: 'Investing Cash Flow', y24: -9800, y23: -6000, indent: 0, type: 'subtotal' },
      { id: 'cf_hf', label: 'FINANCING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'debtpay', label: 'Debt Repayment', y24: -3000, y23: -1500, indent: 1, type: 'normal' },
      { id: 'repo', label: 'Share Repurchases', y24: -5000, y23: -3000, indent: 1, type: 'normal' },
      { id: 'divs', label: 'Dividends Paid', y24: -2400, y23: -2000, indent: 1, type: 'normal' },
      { id: 'fcf_fin', label: 'Financing Cash Flow', y24: -10400, y23: -6500, indent: 0, type: 'subtotal' },
      { id: 'netchange', label: 'Net Change in Cash', y24: -4120, y23: 600, indent: 0, type: 'total' },
    ],
  },

  glef: {
    name: 'GreenLeaf Energy', ticker: 'GLEF', sector: 'Clean Energy',
    icon: Leaf, color: 'emerald', desc: 'Renewable energy company with growing revenue but high capital expenditures typical of the sector.',
    is: [
      { id: 'revenue', label: 'Revenue', y24: 18600, y23: 14200, indent: 0, type: 'total' },
      { id: 'cogs', label: 'Cost of Revenue', y24: -11200, y23: -8800, indent: 1, type: 'expense' },
      { id: 'gross', label: 'Gross Profit', y24: 7400, y23: 5400, indent: 0, type: 'subtotal' },
      { id: 'rd', label: 'Research & Development', y24: -1400, y23: -1100, indent: 1, type: 'expense' },
      { id: 'sga', label: 'Selling, General & Admin', y24: -2600, y23: -2300, indent: 1, type: 'expense' },
      { id: 'opex', label: 'Total Operating Expenses', y24: -4000, y23: -3400, indent: 1, type: 'expense' },
      { id: 'opinc', label: 'Operating Income (EBIT)', y24: 3400, y23: 2000, indent: 0, type: 'subtotal' },
      { id: 'interest', label: 'Interest Expense', y24: -1800, y23: -1600, indent: 1, type: 'expense' },
      { id: 'other', label: 'Other Income', y24: 200, y23: 100, indent: 1, type: 'normal' },
      { id: 'pretax', label: 'Pre-Tax Income', y24: 1800, y23: 500, indent: 0, type: 'subtotal' },
      { id: 'tax', label: 'Income Tax', y24: -270, y23: -75, indent: 1, type: 'expense' },
      { id: 'netinc', label: 'Net Income', y24: 1530, y23: 425, indent: 0, type: 'total' },
    ],
    bs: [
      { id: 'bs_ha', label: 'ASSETS', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cash', label: 'Cash & Equivalents', y24: 3200, y23: 2800, indent: 1, type: 'normal' },
      { id: 'sti', label: 'Short-Term Investments', y24: 600, y23: 400, indent: 1, type: 'normal' },
      { id: 'ar', label: 'Accounts Receivable', y24: 3400, y23: 2600, indent: 1, type: 'normal' },
      { id: 'inv', label: 'Inventory', y24: 1800, y23: 1500, indent: 1, type: 'normal' },
      { id: 'tca', label: 'Total Current Assets', y24: 9000, y23: 7300, indent: 0, type: 'subtotal' },
      { id: 'ppe', label: 'Property, Plant & Equipment', y24: 38000, y23: 32000, indent: 1, type: 'normal' },
      { id: 'gw', label: 'Goodwill', y24: 2200, y23: 2200, indent: 1, type: 'normal' },
      { id: 'intang', label: 'Intangible Assets', y24: 1800, y23: 1600, indent: 1, type: 'normal' },
      { id: 'olta', label: 'Other Long-Term Assets', y24: 1400, y23: 1200, indent: 1, type: 'normal' },
      { id: 'ta', label: 'Total Assets', y24: 52400, y23: 44300, indent: 0, type: 'total' },
      { id: 'bs_hl', label: 'LIABILITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'ap', label: 'Accounts Payable', y24: 3600, y23: 2800, indent: 1, type: 'normal' },
      { id: 'std', label: 'Short-Term Debt', y24: 2400, y23: 2000, indent: 1, type: 'normal' },
      { id: 'accr', label: 'Accrued Liabilities', y24: 1600, y23: 1400, indent: 1, type: 'normal' },
      { id: 'tcl', label: 'Total Current Liabilities', y24: 7600, y23: 6200, indent: 0, type: 'subtotal' },
      { id: 'ltd', label: 'Long-Term Debt', y24: 24000, y23: 20000, indent: 1, type: 'normal' },
      { id: 'oltl', label: 'Other Long-Term Liabilities', y24: 3200, y23: 2800, indent: 1, type: 'normal' },
      { id: 'tl', label: 'Total Liabilities', y24: 34800, y23: 29000, indent: 0, type: 'subtotal' },
      { id: 'bs_he', label: 'SHAREHOLDERS\' EQUITY', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cs', label: 'Common Stock & APIC', y24: 12000, y23: 12000, indent: 1, type: 'normal' },
      { id: 're', label: 'Retained Earnings', y24: 5600, y23: 3300, indent: 1, type: 'normal' },
      { id: 'oeq', label: 'Treasury Stock & Other', y24: 0, y23: 0, indent: 1, type: 'normal' },
      { id: 'te', label: 'Total Equity', y24: 17600, y23: 15300, indent: 0, type: 'subtotal' },
      { id: 'tle', label: 'Total Liabilities & Equity', y24: 52400, y23: 44300, indent: 0, type: 'total' },
    ],
    cf: [
      { id: 'cf_ho', label: 'OPERATING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cf_ni', label: 'Net Income', y24: 1530, y23: 425, indent: 1, type: 'normal' },
      { id: 'depr', label: 'Depreciation & Amortization', y24: 4800, y23: 4000, indent: 1, type: 'normal' },
      { id: 'sbc', label: 'Stock-Based Compensation', y24: 400, y23: 350, indent: 1, type: 'normal' },
      { id: 'wc', label: 'Changes in Working Capital', y24: -600, y23: -400, indent: 1, type: 'normal' },
      { id: 'ocf', label: 'Operating Cash Flow', y24: 6130, y23: 4375, indent: 0, type: 'subtotal' },
      { id: 'cf_hi', label: 'INVESTING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'capex', label: 'Capital Expenditures', y24: -10800, y23: -8000, indent: 1, type: 'normal' },
      { id: 'acq', label: 'Acquisitions', y24: 0, y23: -1200, indent: 1, type: 'normal' },
      { id: 'invp', label: 'Investment Purchases', y24: -200, y23: -100, indent: 1, type: 'normal' },
      { id: 'icf', label: 'Investing Cash Flow', y24: -11000, y23: -9300, indent: 0, type: 'subtotal' },
      { id: 'cf_hf', label: 'FINANCING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'debtpay', label: 'Debt Repayment', y24: -2000, y23: -1500, indent: 1, type: 'normal' },
      { id: 'repo', label: 'Share Repurchases', y24: 0, y23: 0, indent: 1, type: 'normal' },
      { id: 'divs', label: 'Dividends Paid', y24: -730, y23: -400, indent: 1, type: 'normal' },
      { id: 'fcf_fin', label: 'Financing Cash Flow', y24: 5270, y23: 5625, indent: 0, type: 'subtotal' },
      { id: 'netchange', label: 'Net Change in Cash', y24: 400, y23: 700, indent: 0, type: 'total' },
    ],
  },

  mdch: {
    name: 'MediCore Health', ticker: 'MDCH', sector: 'Healthcare / Pharma',
    icon: Heart, color: 'rose', desc: 'Pharmaceutical company with blockbuster drugs, high R&D spending, and patent cliff risk.',
    is: [
      { id: 'revenue', label: 'Revenue', y24: 38200, y23: 35800, indent: 0, type: 'total' },
      { id: 'cogs', label: 'Cost of Revenue', y24: -9600, y23: -9000, indent: 1, type: 'expense' },
      { id: 'gross', label: 'Gross Profit', y24: 28600, y23: 26800, indent: 0, type: 'subtotal' },
      { id: 'rd', label: 'Research & Development', y24: -9500, y23: -8800, indent: 1, type: 'expense' },
      { id: 'sga', label: 'Selling, General & Admin', y24: -7200, y23: -6900, indent: 1, type: 'expense' },
      { id: 'opex', label: 'Total Operating Expenses', y24: -16700, y23: -15700, indent: 1, type: 'expense' },
      { id: 'opinc', label: 'Operating Income (EBIT)', y24: 11900, y23: 11100, indent: 0, type: 'subtotal' },
      { id: 'interest', label: 'Interest Expense', y24: -900, y23: -1000, indent: 1, type: 'expense' },
      { id: 'other', label: 'Other Income', y24: 600, y23: 400, indent: 1, type: 'normal' },
      { id: 'pretax', label: 'Pre-Tax Income', y24: 11600, y23: 10500, indent: 0, type: 'subtotal' },
      { id: 'tax', label: 'Income Tax', y24: -1740, y23: -1575, indent: 1, type: 'expense' },
      { id: 'netinc', label: 'Net Income', y24: 9860, y23: 8925, indent: 0, type: 'total' },
    ],
    bs: [
      { id: 'bs_ha', label: 'ASSETS', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cash', label: 'Cash & Equivalents', y24: 12400, y23: 10800, indent: 1, type: 'normal' },
      { id: 'sti', label: 'Short-Term Investments', y24: 5600, y23: 4800, indent: 1, type: 'normal' },
      { id: 'ar', label: 'Accounts Receivable', y24: 6200, y23: 5800, indent: 1, type: 'normal' },
      { id: 'inv', label: 'Inventory', y24: 4800, y23: 4400, indent: 1, type: 'normal' },
      { id: 'tca', label: 'Total Current Assets', y24: 29000, y23: 25800, indent: 0, type: 'subtotal' },
      { id: 'ppe', label: 'Property, Plant & Equipment', y24: 14200, y23: 13000, indent: 1, type: 'normal' },
      { id: 'gw', label: 'Goodwill', y24: 18000, y23: 18000, indent: 1, type: 'normal' },
      { id: 'intang', label: 'Intangible Assets', y24: 12000, y23: 13500, indent: 1, type: 'normal' },
      { id: 'olta', label: 'Other Long-Term Assets', y24: 2800, y23: 2500, indent: 1, type: 'normal' },
      { id: 'ta', label: 'Total Assets', y24: 76000, y23: 72800, indent: 0, type: 'total' },
      { id: 'bs_hl', label: 'LIABILITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'ap', label: 'Accounts Payable', y24: 4200, y23: 3800, indent: 1, type: 'normal' },
      { id: 'std', label: 'Short-Term Debt', y24: 3000, y23: 2500, indent: 1, type: 'normal' },
      { id: 'accr', label: 'Accrued Liabilities', y24: 5800, y23: 5200, indent: 1, type: 'normal' },
      { id: 'tcl', label: 'Total Current Liabilities', y24: 13000, y23: 11500, indent: 0, type: 'subtotal' },
      { id: 'ltd', label: 'Long-Term Debt', y24: 16000, y23: 18000, indent: 1, type: 'normal' },
      { id: 'oltl', label: 'Other Long-Term Liabilities', y24: 4000, y23: 3800, indent: 1, type: 'normal' },
      { id: 'tl', label: 'Total Liabilities', y24: 33000, y23: 33300, indent: 0, type: 'subtotal' },
      { id: 'bs_he', label: 'SHAREHOLDERS\' EQUITY', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cs', label: 'Common Stock & APIC', y24: 8000, y23: 8000, indent: 1, type: 'normal' },
      { id: 're', label: 'Retained Earnings', y24: 37000, y23: 33500, indent: 1, type: 'normal' },
      { id: 'oeq', label: 'Treasury Stock & Other', y24: -2000, y23: -2000, indent: 1, type: 'normal' },
      { id: 'te', label: 'Total Equity', y24: 43000, y23: 39500, indent: 0, type: 'subtotal' },
      { id: 'tle', label: 'Total Liabilities & Equity', y24: 76000, y23: 72800, indent: 0, type: 'total' },
    ],
    cf: [
      { id: 'cf_ho', label: 'OPERATING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cf_ni', label: 'Net Income', y24: 9860, y23: 8925, indent: 1, type: 'normal' },
      { id: 'depr', label: 'Depreciation & Amortization', y24: 3800, y23: 3600, indent: 1, type: 'normal' },
      { id: 'sbc', label: 'Stock-Based Compensation', y24: 1200, y23: 1000, indent: 1, type: 'normal' },
      { id: 'wc', label: 'Changes in Working Capital', y24: -800, y23: -600, indent: 1, type: 'normal' },
      { id: 'ocf', label: 'Operating Cash Flow', y24: 14060, y23: 12925, indent: 0, type: 'subtotal' },
      { id: 'cf_hi', label: 'INVESTING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'capex', label: 'Capital Expenditures', y24: -3000, y23: -2800, indent: 1, type: 'normal' },
      { id: 'acq', label: 'Acquisitions', y24: -1500, y23: -3000, indent: 1, type: 'normal' },
      { id: 'invp', label: 'Investment Purchases', y24: -1400, y23: -1000, indent: 1, type: 'normal' },
      { id: 'icf', label: 'Investing Cash Flow', y24: -5900, y23: -6800, indent: 0, type: 'subtotal' },
      { id: 'cf_hf', label: 'FINANCING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'debtpay', label: 'Debt Repayment', y24: -2000, y23: -1500, indent: 1, type: 'normal' },
      { id: 'repo', label: 'Share Repurchases', y24: -2000, y23: -1800, indent: 1, type: 'normal' },
      { id: 'divs', label: 'Dividends Paid', y24: -2560, y23: -2400, indent: 1, type: 'normal' },
      { id: 'fcf_fin', label: 'Financing Cash Flow', y24: -6560, y23: -5700, indent: 0, type: 'subtotal' },
      { id: 'netchange', label: 'Net Change in Cash', y24: 1600, y23: 425, indent: 0, type: 'total' },
    ],
  },

  ubld: {
    name: 'UrbanBuild Corp', ticker: 'UBLD', sector: 'Real Estate / Construction',
    icon: Building2, color: 'amber', desc: 'Commercial real estate developer with heavy debt load, asset-heavy balance sheet, and cyclical revenue.',
    is: [
      { id: 'revenue', label: 'Revenue', y24: 24800, y23: 26200, indent: 0, type: 'total' },
      { id: 'cogs', label: 'Cost of Revenue', y24: -17400, y23: -18100, indent: 1, type: 'expense' },
      { id: 'gross', label: 'Gross Profit', y24: 7400, y23: 8100, indent: 0, type: 'subtotal' },
      { id: 'rd', label: 'Research & Development', y24: -200, y23: -180, indent: 1, type: 'expense' },
      { id: 'sga', label: 'Selling, General & Admin', y24: -3600, y23: -3400, indent: 1, type: 'expense' },
      { id: 'opex', label: 'Total Operating Expenses', y24: -3800, y23: -3580, indent: 1, type: 'expense' },
      { id: 'opinc', label: 'Operating Income (EBIT)', y24: 3600, y23: 4520, indent: 0, type: 'subtotal' },
      { id: 'interest', label: 'Interest Expense', y24: -2800, y23: -2600, indent: 1, type: 'expense' },
      { id: 'other', label: 'Other Income', y24: 300, y23: 200, indent: 1, type: 'normal' },
      { id: 'pretax', label: 'Pre-Tax Income', y24: 1100, y23: 2120, indent: 0, type: 'subtotal' },
      { id: 'tax', label: 'Income Tax', y24: -275, y23: -530, indent: 1, type: 'expense' },
      { id: 'netinc', label: 'Net Income', y24: 825, y23: 1590, indent: 0, type: 'total' },
    ],
    bs: [
      { id: 'bs_ha', label: 'ASSETS', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cash', label: 'Cash & Equivalents', y24: 2400, y23: 3100, indent: 1, type: 'normal' },
      { id: 'sti', label: 'Short-Term Investments', y24: 200, y23: 300, indent: 1, type: 'normal' },
      { id: 'ar', label: 'Accounts Receivable', y24: 5600, y23: 5200, indent: 1, type: 'normal' },
      { id: 'inv', label: 'Inventory', y24: 8200, y23: 7600, indent: 1, type: 'normal' },
      { id: 'tca', label: 'Total Current Assets', y24: 16400, y23: 16200, indent: 0, type: 'subtotal' },
      { id: 'ppe', label: 'Property, Plant & Equipment', y24: 42000, y23: 40000, indent: 1, type: 'normal' },
      { id: 'gw', label: 'Goodwill', y24: 3000, y23: 3000, indent: 1, type: 'normal' },
      { id: 'intang', label: 'Intangible Assets', y24: 1200, y23: 1400, indent: 1, type: 'normal' },
      { id: 'olta', label: 'Other Long-Term Assets', y24: 2400, y23: 2200, indent: 1, type: 'normal' },
      { id: 'ta', label: 'Total Assets', y24: 65000, y23: 62800, indent: 0, type: 'total' },
      { id: 'bs_hl', label: 'LIABILITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'ap', label: 'Accounts Payable', y24: 6000, y23: 5400, indent: 1, type: 'normal' },
      { id: 'std', label: 'Short-Term Debt', y24: 4800, y23: 4200, indent: 1, type: 'normal' },
      { id: 'accr', label: 'Accrued Liabilities', y24: 3200, y23: 2800, indent: 1, type: 'normal' },
      { id: 'tcl', label: 'Total Current Liabilities', y24: 14000, y23: 12400, indent: 0, type: 'subtotal' },
      { id: 'ltd', label: 'Long-Term Debt', y24: 28000, y23: 27000, indent: 1, type: 'normal' },
      { id: 'oltl', label: 'Other Long-Term Liabilities', y24: 4000, y23: 3800, indent: 1, type: 'normal' },
      { id: 'tl', label: 'Total Liabilities', y24: 46000, y23: 43200, indent: 0, type: 'subtotal' },
      { id: 'bs_he', label: 'SHAREHOLDERS\' EQUITY', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cs', label: 'Common Stock & APIC', y24: 6000, y23: 6000, indent: 1, type: 'normal' },
      { id: 're', label: 'Retained Earnings', y24: 13000, y23: 13600, indent: 1, type: 'normal' },
      { id: 'oeq', label: 'Treasury Stock & Other', y24: 0, y23: 0, indent: 1, type: 'normal' },
      { id: 'te', label: 'Total Equity', y24: 19000, y23: 19600, indent: 0, type: 'subtotal' },
      { id: 'tle', label: 'Total Liabilities & Equity', y24: 65000, y23: 62800, indent: 0, type: 'total' },
    ],
    cf: [
      { id: 'cf_ho', label: 'OPERATING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cf_ni', label: 'Net Income', y24: 825, y23: 1590, indent: 1, type: 'normal' },
      { id: 'depr', label: 'Depreciation & Amortization', y24: 4200, y23: 3800, indent: 1, type: 'normal' },
      { id: 'sbc', label: 'Stock-Based Compensation', y24: 300, y23: 250, indent: 1, type: 'normal' },
      { id: 'wc', label: 'Changes in Working Capital', y24: -1200, y23: -900, indent: 1, type: 'normal' },
      { id: 'ocf', label: 'Operating Cash Flow', y24: 4125, y23: 4740, indent: 0, type: 'subtotal' },
      { id: 'cf_hi', label: 'INVESTING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'capex', label: 'Capital Expenditures', y24: -6200, y23: -5800, indent: 1, type: 'normal' },
      { id: 'acq', label: 'Acquisitions', y24: 0, y23: -500, indent: 1, type: 'normal' },
      { id: 'invp', label: 'Investment Purchases', y24: -100, y23: -200, indent: 1, type: 'normal' },
      { id: 'icf', label: 'Investing Cash Flow', y24: -6300, y23: -6500, indent: 0, type: 'subtotal' },
      { id: 'cf_hf', label: 'FINANCING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'debtpay', label: 'Debt Repayment', y24: -1500, y23: -1200, indent: 1, type: 'normal' },
      { id: 'repo', label: 'Share Repurchases', y24: 0, y23: 0, indent: 1, type: 'normal' },
      { id: 'divs', label: 'Dividends Paid', y24: -1425, y23: -1400, indent: 1, type: 'normal' },
      { id: 'fcf_fin', label: 'Financing Cash Flow', y24: 1475, y23: 2360, indent: 0, type: 'subtotal' },
      { id: 'netchange', label: 'Net Change in Cash', y24: -700, y23: 600, indent: 0, type: 'total' },
    ],
  },

  fmrt: {
    name: 'FreshMart Inc.', ticker: 'FMRT', sector: 'Retail / Consumer Goods',
    icon: ShoppingCart, color: 'orange', desc: 'Large grocery & retail chain with thin margins, huge revenue, and heavy inventory management.',
    is: [
      { id: 'revenue', label: 'Revenue', y24: 142000, y23: 136000, indent: 0, type: 'total' },
      { id: 'cogs', label: 'Cost of Revenue', y24: -106500, y23: -102000, indent: 1, type: 'expense' },
      { id: 'gross', label: 'Gross Profit', y24: 35500, y23: 34000, indent: 0, type: 'subtotal' },
      { id: 'rd', label: 'Research & Development', y24: -400, y23: -350, indent: 1, type: 'expense' },
      { id: 'sga', label: 'Selling, General & Admin', y24: -27000, y23: -26200, indent: 1, type: 'expense' },
      { id: 'opex', label: 'Total Operating Expenses', y24: -27400, y23: -26550, indent: 1, type: 'expense' },
      { id: 'opinc', label: 'Operating Income (EBIT)', y24: 8100, y23: 7450, indent: 0, type: 'subtotal' },
      { id: 'interest', label: 'Interest Expense', y24: -1400, y23: -1500, indent: 1, type: 'expense' },
      { id: 'other', label: 'Other Income', y24: 200, y23: 150, indent: 1, type: 'normal' },
      { id: 'pretax', label: 'Pre-Tax Income', y24: 6900, y23: 6100, indent: 0, type: 'subtotal' },
      { id: 'tax', label: 'Income Tax', y24: -1725, y23: -1525, indent: 1, type: 'expense' },
      { id: 'netinc', label: 'Net Income', y24: 5175, y23: 4575, indent: 0, type: 'total' },
    ],
    bs: [
      { id: 'bs_ha', label: 'ASSETS', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cash', label: 'Cash & Equivalents', y24: 6800, y23: 7200, indent: 1, type: 'normal' },
      { id: 'sti', label: 'Short-Term Investments', y24: 1200, y23: 1000, indent: 1, type: 'normal' },
      { id: 'ar', label: 'Accounts Receivable', y24: 3200, y23: 3000, indent: 1, type: 'normal' },
      { id: 'inv', label: 'Inventory', y24: 16800, y23: 15600, indent: 1, type: 'normal' },
      { id: 'tca', label: 'Total Current Assets', y24: 28000, y23: 26800, indent: 0, type: 'subtotal' },
      { id: 'ppe', label: 'Property, Plant & Equipment', y24: 48000, y23: 45000, indent: 1, type: 'normal' },
      { id: 'gw', label: 'Goodwill', y24: 6000, y23: 6000, indent: 1, type: 'normal' },
      { id: 'intang', label: 'Intangible Assets', y24: 2800, y23: 3000, indent: 1, type: 'normal' },
      { id: 'olta', label: 'Other Long-Term Assets', y24: 5200, y23: 4800, indent: 1, type: 'normal' },
      { id: 'ta', label: 'Total Assets', y24: 90000, y23: 85600, indent: 0, type: 'total' },
      { id: 'bs_hl', label: 'LIABILITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'ap', label: 'Accounts Payable', y24: 14000, y23: 13000, indent: 1, type: 'normal' },
      { id: 'std', label: 'Short-Term Debt', y24: 3600, y23: 3200, indent: 1, type: 'normal' },
      { id: 'accr', label: 'Accrued Liabilities', y24: 8400, y23: 7800, indent: 1, type: 'normal' },
      { id: 'tcl', label: 'Total Current Liabilities', y24: 26000, y23: 24000, indent: 0, type: 'subtotal' },
      { id: 'ltd', label: 'Long-Term Debt', y24: 22000, y23: 23000, indent: 1, type: 'normal' },
      { id: 'oltl', label: 'Other Long-Term Liabilities', y24: 6000, y23: 5600, indent: 1, type: 'normal' },
      { id: 'tl', label: 'Total Liabilities', y24: 54000, y23: 52600, indent: 0, type: 'subtotal' },
      { id: 'bs_he', label: 'SHAREHOLDERS\' EQUITY', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cs', label: 'Common Stock & APIC', y24: 4000, y23: 4000, indent: 1, type: 'normal' },
      { id: 're', label: 'Retained Earnings', y24: 34000, y23: 31000, indent: 1, type: 'normal' },
      { id: 'oeq', label: 'Treasury Stock & Other', y24: -2000, y23: -2000, indent: 1, type: 'normal' },
      { id: 'te', label: 'Total Equity', y24: 36000, y23: 33000, indent: 0, type: 'subtotal' },
      { id: 'tle', label: 'Total Liabilities & Equity', y24: 90000, y23: 85600, indent: 0, type: 'total' },
    ],
    cf: [
      { id: 'cf_ho', label: 'OPERATING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'cf_ni', label: 'Net Income', y24: 5175, y23: 4575, indent: 1, type: 'normal' },
      { id: 'depr', label: 'Depreciation & Amortization', y24: 5400, y23: 5000, indent: 1, type: 'normal' },
      { id: 'sbc', label: 'Stock-Based Compensation', y24: 600, y23: 500, indent: 1, type: 'normal' },
      { id: 'wc', label: 'Changes in Working Capital', y24: -800, y23: -500, indent: 1, type: 'normal' },
      { id: 'ocf', label: 'Operating Cash Flow', y24: 10375, y23: 9575, indent: 0, type: 'subtotal' },
      { id: 'cf_hi', label: 'INVESTING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'capex', label: 'Capital Expenditures', y24: -6200, y23: -5600, indent: 1, type: 'normal' },
      { id: 'acq', label: 'Acquisitions', y24: -800, y23: -400, indent: 1, type: 'normal' },
      { id: 'invp', label: 'Investment Purchases', y24: -400, y23: -300, indent: 1, type: 'normal' },
      { id: 'icf', label: 'Investing Cash Flow', y24: -7400, y23: -6300, indent: 0, type: 'subtotal' },
      { id: 'cf_hf', label: 'FINANCING ACTIVITIES', y24: null, y23: null, indent: 0, type: 'header' },
      { id: 'debtpay', label: 'Debt Repayment', y24: -1200, y23: -1000, indent: 1, type: 'normal' },
      { id: 'repo', label: 'Share Repurchases', y24: -1000, y23: -800, indent: 1, type: 'normal' },
      { id: 'divs', label: 'Dividends Paid', y24: -2175, y23: -2000, indent: 1, type: 'normal' },
      { id: 'fcf_fin', label: 'Financing Cash Flow', y24: -3375, y23: -2800, indent: 0, type: 'subtotal' },
      { id: 'netchange', label: 'Net Change in Cash', y24: -400, y23: 475, indent: 0, type: 'total' },
    ],
  },
};

const COMPANY_KEYS = Object.keys(COMPANIES);

/* ── Explanations ── */
const EXP = {
  revenue: { t: 'Revenue (Top Line)', e: '💰', d: 'Total money earned from selling products or services — the "top line" of the business.', tip: 'Look for organic revenue growth (not just from acquisitions). Recurring revenue (subscriptions) is valued more highly than one-time sales.' },
  cogs: { t: 'Cost of Revenue', e: '🏭', d: 'Direct costs of producing goods or delivering services — materials, labor, server costs.', tip: 'A rising COGS-to-revenue ratio means the company is less efficient. For SaaS companies, this includes cloud hosting costs.' },
  gross: { t: 'Gross Profit', e: '📊', d: 'Revenue minus Cost of Revenue. Shows how much money is left after the direct cost of delivering the product.', tip: 'Gross margin (Gross Profit ÷ Revenue) is key. Software: 70-85%, Retail: 25-40%, Manufacturing: 30-50%.' },
  rd: { t: 'Research & Development', e: '🔬', d: 'Money spent developing new products and improving existing ones.', tip: 'High R&D signals future growth potential. Tech companies typically spend 15-20% of revenue on R&D.' },
  sga: { t: 'Selling, General & Admin', e: '🏢', d: 'Running-the-business costs: marketing, executive salaries, office rent, legal, etc.', tip: 'SG&A should grow slower than revenue (operating leverage). Sudden spikes may indicate poor cost discipline.' },
  opex: { t: 'Total Operating Expenses', e: '📋', d: 'All costs of running the business excluding direct production costs. Includes R&D + SG&A.', tip: 'Compare OpEx as a % of revenue year-over-year. A declining ratio = the business is scaling efficiently.' },
  opinc: { t: 'Operating Income (EBIT)', e: '⚡', d: 'Profit from core business operations, before interest and taxes.', tip: 'Arguably the most important profit metric — shows how the actual business performs, ignoring financing and tax structure.' },
  interest: { t: 'Interest Expense', e: '🏦', d: 'The cost of borrowing — interest payments on bonds, loans, and credit lines.', tip: 'If interest > 30% of operating income, the company may be over-leveraged. Watch the trend as rates change.' },
  other: { t: 'Other Income / (Expense)', e: '📎', d: 'Non-core items: investment gains/losses, FX impacts, one-time items.', tip: 'Be cautious if "other income" is a big part of total profit — it may not repeat.' },
  pretax: { t: 'Pre-Tax Income', e: '📝', d: 'Total profit before income taxes.', tip: 'Useful for comparing companies across different tax jurisdictions or tax strategies.' },
  tax: { t: 'Income Tax', e: '🏛️', d: 'Taxes owed to government on profits.', tip: 'Effective tax rate = Tax ÷ Pre-Tax Income. Watch for unusually low rates — they may be temporary.' },
  netinc: { t: 'Net Income (Bottom Line)', e: '🎯', d: 'Final profit after ALL expenses. This flows to the Balance Sheet and Cash Flow Statement.', tip: 'Net Income connects all three statements: it starts the Cash Flow Statement and adds to Retained Earnings on the Balance Sheet.' },
  cash: { t: 'Cash & Equivalents', e: '💵', d: 'Money in bank accounts plus highly liquid investments convertible to cash instantly.', tip: 'Enough cash for operations is good, but too much idle cash may mean management isn\'t investing in growth.' },
  sti: { t: 'Short-Term Investments', e: '📈', d: 'Investments expected to be converted to cash within one year (bonds, CDs).', tip: 'Together with cash, these form the "cash cushion" investors monitor.' },
  ar: { t: 'Accounts Receivable', e: '📬', d: 'Money customers owe for goods/services already delivered but not yet paid for.', tip: 'If AR grows much faster than revenue, customers may be struggling to pay — a potential red flag.' },
  inv: { t: 'Inventory', e: '📦', d: 'Products waiting to be sold, raw materials, and work-in-progress.', tip: 'Rising inventory relative to sales signals weak demand. Critical for retailers, less so for software.' },
  tca: { t: 'Total Current Assets', e: '🔄', d: 'Assets expected to convert to cash within one year.', tip: 'Current Ratio = Current Assets ÷ Current Liabilities. Above 1.5 is healthy; below 1.0 is a liquidity concern.' },
  ppe: { t: 'Property, Plant & Equipment', e: '🏗️', d: 'Physical assets: buildings, machinery, computers, vehicles (net of depreciation).', tip: 'Capital-intensive businesses have large PP&E. Asset-light models (software) have minimal.' },
  gw: { t: 'Goodwill', e: '🤝', d: 'Premium paid when acquiring another company above the fair value of its assets.', tip: 'Large goodwill write-downs mean the company overpaid — a red flag about management\'s M&A discipline.' },
  intang: { t: 'Intangible Assets', e: '💡', d: 'Non-physical assets: patents, trademarks, customer relationships, technology licenses.', tip: 'These represent competitive advantages but can become worthless if technology shifts.' },
  olta: { t: 'Other Long-Term Assets', e: '📦', d: 'Deferred tax assets, right-of-use assets, long-term prepaid expenses.', tip: 'Large deferred tax assets may mean the company has past losses it can use to offset future taxes.' },
  ta: { t: 'Total Assets', e: '🏦', d: 'Everything the company owns.', tip: 'Return on Assets (ROA) = Net Income ÷ Total Assets shows how efficiently resources generate profit.' },
  ap: { t: 'Accounts Payable', e: '📮', d: 'Money owed to suppliers for goods/services received but not yet paid.', tip: 'Stretching payables frees cash but can damage supplier relationships.' },
  std: { t: 'Short-Term Debt', e: '📅', d: 'Loans due within one year, including current portion of long-term debt.', tip: 'If short-term debt is high relative to cash, the company faces refinancing risk.' },
  accr: { t: 'Accrued Liabilities', e: '📝', d: 'Expenses incurred but not yet paid — wages, utilities, taxes due.', tip: 'Normal operating obligations. Watch for unusual spikes that may be hiding problems.' },
  tcl: { t: 'Total Current Liabilities', e: '⏰', d: 'Obligations due within one year.', tip: 'Current Ratio = Current Assets ÷ Current Liabilities. The fundamental liquidity test.' },
  ltd: { t: 'Long-Term Debt', e: '📊', d: 'Loans and bonds due after one year. The main source of financial leverage.', tip: 'Debt/Equity above 2x is high leverage for most industries. Check if debt is increasing or decreasing.' },
  oltl: { t: 'Other Long-Term Liabilities', e: '📋', d: 'Pensions, lease obligations, deferred revenue, and other long-term obligations.', tip: 'Large pension liabilities can be a hidden risk for older industrial companies.' },
  tl: { t: 'Total Liabilities', e: '📋', d: 'All obligations owed to creditors and suppliers.', tip: 'Compare to total equity. Healthy companies typically have more equity than debt.' },
  cs: { t: 'Common Stock & APIC', e: '📜', d: 'Par value of all shares issued plus additional paid-in capital from IPOs and offerings.', tip: 'Large increases mean new share issuance (dilution to existing shareholders).' },
  re: { t: 'Retained Earnings', e: '🏦', d: 'Accumulated net income minus all dividends ever paid. Where Net Income from the Income Statement flows to.', tip: 'Growing retained earnings = the company is compounding wealth. Declines mean more paid out than earned.' },
  oeq: { t: 'Treasury Stock & Other', e: '📊', d: 'Shares repurchased (treasury stock), accumulated other comprehensive income, and other adjustments.', tip: 'Treasury stock from buybacks reduces equity. This is the Balance Sheet reflection of share repurchase programs.' },
  te: { t: 'Total Equity', e: '👥', d: 'Shareholders\' claim on the company: Assets minus Liabilities. Also called book value.', tip: 'ROE = Net Income ÷ Equity. Warren Buffett looks for consistent ROE above 15%.' },
  tle: { t: 'Total Liab & Equity', e: '⚖️', d: 'Must equal Total Assets. This IS the accounting equation: Assets = Liabilities + Equity.', tip: 'If this doesn\'t balance, the books are wrong. Every asset is funded by either debt or ownership.' },
  cf_ni: { t: 'Net Income (from IS)', e: '🎯', d: 'Starting point for operating cash flow — straight from the Income Statement.', tip: 'This is the first cross-statement link: Income Statement → Cash Flow Statement.' },
  depr: { t: 'Depreciation & Amortization', e: '📉', d: 'Non-cash expense added back. It reduced Net Income but no cash actually left.', tip: 'Major reason cash flow ≠ net income. Companies with large PP&E have high D&A.' },
  sbc: { t: 'Stock-Based Compensation', e: '🎫', d: 'Employee compensation in stock — a real cost (dilution) but no cash leaves.', tip: 'Heavy SBC makes cash flow look better than economic reality. Very common in tech.' },
  wc: { t: 'Working Capital Changes', e: '🔄', d: 'Cash impact from changes in receivables, inventory, payables, etc.', tip: 'Negative = company is tying up more cash in operations. Positive = freeing up cash.' },
  ocf: { t: 'Operating Cash Flow', e: '💪', d: 'Cash generated by core operations. The most important cash flow figure.', tip: 'OCF should be higher than Net Income. If consistently lower, earnings quality is poor.' },
  capex: { t: 'Capital Expenditures', e: '🏗️', d: 'Cash spent on physical assets — equipment, buildings, technology infrastructure.', tip: 'Free Cash Flow = OCF - CapEx. This is the cash truly available to investors.' },
  acq: { t: 'Acquisitions', e: '🤝', d: 'Cash spent buying other companies.', tip: 'Frequent acquisitions increase goodwill and integration risk. Check post-acquisition returns.' },
  invp: { t: 'Investment Purchases', e: '💼', d: 'Cash spent on marketable securities and financial investments.', tip: 'Watch the net of purchases vs. maturities to see if the company is building or drawing down.' },
  icf: { t: 'Investing Cash Flow', e: '📊', d: 'Net cash used for long-term investments. Usually negative for growing companies.', tip: 'Negative = investing in growth (normal). Positive could mean selling assets to raise cash (concerning).' },
  debtpay: { t: 'Debt Repayment', e: '🏦', d: 'Cash used to pay back loans and bonds.', tip: 'Consistent repayment = financial discipline. Watch if old debt is just being replaced with new.' },
  repo: { t: 'Share Repurchases', e: '🔄', d: 'Cash spent buying back own shares from the market.', tip: 'Buybacks at low valuations create value. At high valuations, they destroy it. Check timing vs. insider sales.' },
  divs: { t: 'Dividends Paid', e: '💸', d: 'Cash distributed to shareholders.', tip: 'Payout ratio (Dividends ÷ Net Income) above 80% is risky — little room for earnings decline.' },
  fcf_fin: { t: 'Financing Cash Flow', e: '🏛️', d: 'Net cash from debt and equity transactions.', tip: 'Negative often means returning cash to investors (buybacks + dividends) — usually positive for mature companies.' },
  netchange: { t: 'Net Change in Cash', e: '📊', d: 'Operating + Investing + Financing = total cash position change.', tip: 'This links to the Balance Sheet: Beginning Cash + Net Change = Ending Cash on the balance sheet.' },
};

/* ── Quiz ── */
const QUIZ = [
  { q: 'Revenue minus Cost of Revenue equals…?', o: ['Operating Income', 'Gross Profit', 'Net Income', 'EBITDA'], a: 1, x: 'Gross Profit = Revenue - COGS. It shows profit before operating expenses, interest, and taxes.' },
  { q: 'The fundamental accounting equation is…?', o: ['Revenue = Expenses + Profit', 'Assets = Liabilities + Equity', 'Cash Flow = Income - Expenses', 'Debt = Assets - Equity'], a: 1, x: 'Assets = Liabilities + Equity. Every resource (asset) is funded by either debt (liability) or ownership (equity).' },
  { q: 'On the Cash Flow Statement, depreciation is…?', o: ['Subtracted from Net Income', 'Added back to Net Income', 'Ignored completely', 'Under Financing Activities'], a: 1, x: 'Depreciation reduced Net Income but no cash left the company, so it\'s added back when calculating Operating Cash Flow.' },
  { q: 'A current ratio of 0.8 means…?', o: ['80% profit margins', 'Strong liquidity', 'Short-term liabilities exceed short-term assets', 'The stock is cheap'], a: 2, x: 'Current Ratio = Current Assets ÷ Current Liabilities. Below 1.0 means the company can\'t fully cover short-term obligations.' },
  { q: 'Free Cash Flow is calculated as…?', o: ['Revenue - Total Expenses', 'Net Income - Dividends', 'Operating Cash Flow - CapEx', 'Gross Profit - OpEx'], a: 2, x: 'FCF = Operating Cash Flow - Capital Expenditures. It represents cash truly available to return to investors or reinvest.' },
  { q: 'Net Income connects to which other statements?', o: ['Only Balance Sheet', 'Only Cash Flow Statement', 'Both Balance Sheet and Cash Flow', 'Neither — they\'re independent'], a: 2, x: 'Net Income starts the Cash Flow Statement AND increases Retained Earnings on the Balance Sheet. It\'s the critical link.' },
  { q: 'Buying a $10M factory appears under…?', o: ['Operating Activities', 'Investing Activities', 'Financing Activities', 'Not on the Cash Flow Statement'], a: 1, x: 'Buying long-term assets (factories, equipment) is classified under Investing Activities as Capital Expenditures.' },
  { q: 'Revenue grows 10%, net income grows 25%. This indicates…?', o: ['Accounting fraud', 'Operating leverage / margin expansion', 'More shares issued', 'Higher tax rates'], a: 1, x: 'Operating leverage: fixed costs are spread over more sales, so profit grows faster than revenue. This is margin expansion.' },
];

/* ════════════════════════════════════════════════════════════
   COLOR MAP
   ════════════════════════════════════════════════════════════ */
const COLOR_MAP = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-400', border: 'border-blue-200', light: 'bg-blue-50' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-400', border: 'border-emerald-200', light: 'bg-emerald-50' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-400', border: 'border-rose-200', light: 'bg-rose-50' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-400', border: 'border-amber-200', light: 'bg-amber-50' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-400', border: 'border-orange-200', light: 'bg-orange-50' },
};

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

function StatementRow({ item, selectedId, onSelect, revenueBase }) {
  if (item.type === 'header') {
    return (
      <div className="pt-4 pb-1 px-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
      </div>
    );
  }
  const isSelected = selectedId === item.id;
  const change = yoyCalc(item.y24, item.y23);
  const pct = revenueBase && item.y24 !== null ? pctOf(item.y24, revenueBase) : null;
  const bold = item.type === 'total' || item.type === 'subtotal';

  let bg = 'hover:bg-background';
  if (item.type === 'total') bg = isSelected ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-blue-50 hover:bg-blue-100';
  else if (item.type === 'subtotal') bg = isSelected ? 'bg-gray-200 ring-2 ring-blue-400' : 'bg-muted hover:bg-gray-150';
  else if (isSelected) bg = 'bg-blue-50 ring-2 ring-blue-400';

  return (
    <motion.div layout onClick={() => onSelect(item.id)}
      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${bg}`}
      style={{ marginLeft: item.indent * 20 }}>
      <span className={`text-sm text-foreground flex-1 ${bold ? 'font-semibold' : ''}`}>{item.label}</span>
      <div className="flex items-center gap-2 sm:gap-4">
        {pct && <span className="text-xs text-muted-foreground w-12 text-right hidden sm:block">{pct}</span>}
        <span className={`text-sm font-mono w-20 text-right ${item.y24 < 0 ? 'text-red-600' : item.type === 'total' ? 'text-blue-700' : 'text-foreground'} ${bold ? 'font-semibold' : ''}`}>
          {item.y24 !== null ? '$' + fmt(item.y24) : ''}
        </span>
        <span className="text-xs text-muted-foreground font-mono w-16 text-right hidden md:block">
          {item.y23 !== null ? '$' + fmt(item.y23) : ''}
        </span>
        {change !== null ? (
          <span className={`text-xs w-14 text-right hidden sm:block ${parseFloat(change) > 0 ? 'text-emerald-600' : parseFloat(change) < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {parseFloat(change) > 0 ? '+' : ''}{change}%
          </span>
        ) : <span className="w-14 hidden sm:block" />}
      </div>
    </motion.div>
  );
}

function ExplanationPanel({ selectedItem }) {
  const info = selectedItem ? EXP[selectedItem] : null;
  return (
    <div className="sticky top-20">
      <AnimatePresence mode="wait">
        {info ? (
          <motion.div key={selectedItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-blue-200 bg-gradient-to-b from-blue-50 to-white">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{info.e}</span>
                  <h4 className="font-semibold text-foreground text-sm">{info.t}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{info.d}</p>
                <div className="pt-2 border-t border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Investor Tip
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{info.tip}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-dashed border-border bg-background">
              <CardContent className="p-5 text-center text-muted-foreground">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">Click a line item</p>
                <p className="text-xs mt-1">to see what it means and why investors care</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColumnHeader() {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground font-medium border-b border-border mb-1">
      <span className="flex-1">Line Item</span>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="w-12 text-right hidden sm:block">% Rev</span>
        <span className="w-20 text-right">FY 2024</span>
        <span className="w-16 text-right hidden md:block">FY 2023</span>
        <span className="w-14 text-right hidden sm:block">YoY</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPANY SELECTOR
   ════════════════════════════════════════════════════════════ */
function CompanySelector({ activeCompany, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMPANY_KEYS.map(key => {
        const c = COMPANIES[key];
        const cm = COLOR_MAP[c.color];
        const active = activeCompany === key;
        const Icon = c.icon;
        return (
          <button key={key} onClick={() => onChange(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-sm font-medium
              ${active
                ? `${cm.light} ${cm.border} ${cm.text} ring-2 ${cm.ring}`
                : 'border-border text-muted-foreground hover:border-border hover:bg-background'}`}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{c.name}</span>
            <span className="sm:hidden">{c.ticker}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function FinancialStatements() {
  const [tab, setTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCompany, setActiveCompany] = useState('nvtk');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  // Sandbox sliders
  const [sbRev, setSbRev] = useState(50000);
  const [sbGM, setSbGM] = useState(60);
  const [sbOpex, setSbOpex] = useState(29);
  const [sbTax, setSbTax] = useState(20);

  const co = COMPANIES[activeCompany];
  const cm = COLOR_MAP[co.color];
  const CoIcon = co.icon;

  // Derived data for current company
  const revenue24 = co.is.find(i => i.id === 'revenue')?.y24 || 1;
  const gross24 = co.is.find(i => i.id === 'gross')?.y24 || 0;
  const opinc24 = co.is.find(i => i.id === 'opinc')?.y24 || 0;
  const netinc24 = co.is.find(i => i.id === 'netinc')?.y24 || 0;
  const tca24 = co.bs.find(i => i.id === 'tca')?.y24 || 1;
  const tcl24 = co.bs.find(i => i.id === 'tcl')?.y24 || 1;
  const ta24 = co.bs.find(i => i.id === 'ta')?.y24 || 1;
  const te24 = co.bs.find(i => i.id === 'te')?.y24 || 1;
  const ltd24 = co.bs.find(i => i.id === 'ltd')?.y24 || 0;
  const std24 = co.bs.find(i => i.id === 'std')?.y24 || 0;
  const ocf24 = co.cf.find(i => i.id === 'ocf')?.y24 || 0;
  const capex24 = Math.abs(co.cf.find(i => i.id === 'capex')?.y24 || 0);
  const icf24 = co.cf.find(i => i.id === 'icf')?.y24 || 0;
  const fcf_fin24 = co.cf.find(i => i.id === 'fcf_fin')?.y24 || 0;

  const metrics = useMemo(() => ({
    gm: (gross24 / revenue24 * 100).toFixed(1),
    om: (opinc24 / revenue24 * 100).toFixed(1),
    nm: (netinc24 / revenue24 * 100).toFixed(1),
    cr: (tca24 / tcl24).toFixed(2),
    de: ((ltd24 + std24) / te24).toFixed(2),
    roe: (netinc24 / te24 * 100).toFixed(1),
    fcf: ocf24 - capex24,
    roa: (netinc24 / ta24 * 100).toFixed(1),
  }), [activeCompany, gross24, revenue24, opinc24, netinc24, tca24, tcl24, ltd24, std24, te24, ocf24, capex24, ta24]);

  const cfCatData = [
    { name: 'Operating', value: ocf24 },
    { name: 'Investing', value: icf24 },
    { name: 'Financing', value: fcf_fin24 },
  ];
  const cfColors = ['#10b981', '#f97316', '#8b5cf6'];

  // Sandbox
  const sandbox = useMemo(() => {
    const rev = sbRev;
    const cogs = rev * (1 - sbGM / 100);
    const gross = rev - cogs;
    const opex = rev * (sbOpex / 100);
    const opinc = gross - opex;
    const tax = opinc > 0 ? opinc * (sbTax / 100) : 0;
    const net = opinc - tax;
    return { rev, cogs, gross, opex, opinc, tax, net };
  }, [sbRev, sbGM, sbOpex, sbTax]);

  const sbChart = useMemo(() => [
    { name: 'Revenue', value: sandbox.rev, color: '#3b82f6' },
    { name: 'COGS', value: -sandbox.cogs, color: '#ef4444' },
    { name: 'Gross', value: sandbox.gross, color: '#10b981' },
    { name: 'OpEx', value: -sandbox.opex, color: '#f97316' },
    { name: 'Op Inc', value: sandbox.opinc, color: '#8b5cf6' },
    { name: 'Tax', value: -sandbox.tax, color: '#ef4444' },
    { name: 'Net Inc', value: sandbox.net, color: sandbox.net >= 0 ? '#10b981' : '#ef4444' },
  ], [sandbox]);

  const quizScore = useMemo(() => {
    let c = 0, t = 0;
    Object.entries(quizAnswers).forEach(([qi, ai]) => { t++; if (QUIZ[qi].a === ai) c++; });
    return { c, t };
  }, [quizAnswers]);

  const handleQuiz = (qi, ai) => {
    setQuizAnswers(p => ({ ...p, [qi]: ai }));
    setQuizRevealed(p => ({ ...p, [qi]: true }));
  };

  const handleCompanyChange = (key) => {
    setActiveCompany(key);
    setSelectedItem(null);
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Financial Statements Lab
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Interactive guide to reading financial statements like a professional investor</p>
        </div>
      </div>

      {/* Company Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Select a Company
            </h3>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">FY 2024 vs 2023</Badge>
          </div>
          <CompanySelector activeCompany={activeCompany} onChange={handleCompanyChange} />
          {/* Company Info */}
          <div className={`mt-3 p-3 rounded-xl ${cm.light} ${cm.border} border flex items-start gap-3`}>
            <div className={`w-9 h-9 rounded-lg ${cm.bg} flex items-center justify-center shrink-0`}>
              <CoIcon className={`w-5 h-5 ${cm.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground">{co.name}</span>
                <Badge variant="outline" className={`text-xs ${cm.border} ${cm.text}`}>{co.ticker}</Badge>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">{co.sector}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{co.desc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedItem(null); }}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="text-xs flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="income" className="text-xs flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Income Stmt</TabsTrigger>
          <TabsTrigger value="balance" className="text-xs flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow" className="text-xs flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Cash Flow</TabsTrigger>
          <TabsTrigger value="sandbox" className="text-xs flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> Sandbox</TabsTrigger>
          <TabsTrigger value="quiz" className="text-xs flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Quiz</TabsTrigger>
        </TabsList>

        {/* ══════ OVERVIEW ══════ */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> The Three Financial Statements
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every public company reports three core financial statements. Together they tell the complete story: how much the company earns (Income Statement), what it owns and owes (Balance Sheet), and where cash comes from and goes (Cash Flow Statement). Try switching between the 5 companies above to see how different industries create very different financial profiles.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Income Statement', icon: DollarSign, bg: 'bg-blue-100', ic: 'text-blue-600', lc: 'text-blue-600', desc: 'How much did we earn?', items: ['Revenue → Costs → Profit', 'Covers a period (e.g., Q1 2024)', 'Key output: Net Income'], link: 'Net Income flows to →' },
              { title: 'Cash Flow Statement', icon: Wallet, bg: 'bg-emerald-100', ic: 'text-emerald-600', lc: 'text-emerald-600', desc: 'Where did cash go?', items: ['Operating + Investing + Financing', 'Covers a period (e.g., Q1 2024)', 'Key output: Net Cash Change'], link: 'Ending Cash appears on →' },
              { title: 'Balance Sheet', icon: Layers, bg: 'bg-purple-100', ic: 'text-purple-600', lc: 'text-purple-600', desc: 'What do we own & owe?', items: ['Assets = Liabilities + Equity', 'Snapshot at a point in time', 'Key equation: A = L + E'], link: 'Retained Earnings includes NI' },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4 h-4 ${s.ic}`} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                  {s.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <ChevronRight className="w-3 h-3 text-gray-300" /> {item}
                    </div>
                  ))}
                  <div className={`mt-3 pt-3 border-t border-border text-xs font-medium ${s.lc} flex items-center gap-1`}>
                    <ArrowRight className="w-3 h-3" /> {s.link}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CoIcon className={`w-4 h-4 ${cm.text}`} /> {co.name} — Key Metrics at a Glance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Gross Margin', value: metrics.gm + '%', icon: TrendingUp, color: 'text-emerald-600' },
                  { label: 'Operating Margin', value: metrics.om + '%', icon: Zap, color: 'text-blue-600' },
                  { label: 'Current Ratio', value: metrics.cr + 'x', icon: Layers, color: 'text-purple-600' },
                  { label: 'Free Cash Flow', value: '$' + metrics.fcf.toLocaleString() + 'M', icon: Wallet, color: 'text-emerald-600' },
                  { label: 'Net Margin', value: metrics.nm + '%', icon: DollarSign, color: 'text-blue-600' },
                  { label: 'Debt/Equity', value: metrics.de + 'x', icon: Layers, color: parseFloat(metrics.de) > 1.5 ? 'text-red-500' : 'text-purple-600' },
                  { label: 'Return on Equity', value: metrics.roe + '%', icon: Award, color: 'text-amber-600' },
                  { label: 'Return on Assets', value: metrics.roa + '%', icon: Building2, color: 'text-muted-foreground' },
                ].map((m, i) => (
                  <div key={i} className="p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </div>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cross-company comparison teaser */}
          <Card className="border-dashed border-border">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Compare Across Companies
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Company</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Revenue</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Gross Margin</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Net Margin</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Debt/Equity</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">ROE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPANY_KEYS.map(key => {
                      const c = COMPANIES[key];
                      const rev = c.is.find(i => i.id === 'revenue')?.y24 || 1;
                      const gross = c.is.find(i => i.id === 'gross')?.y24 || 0;
                      const net = c.is.find(i => i.id === 'netinc')?.y24 || 0;
                      const eq = c.bs.find(i => i.id === 'te')?.y24 || 1;
                      const lt = c.bs.find(i => i.id === 'ltd')?.y24 || 0;
                      const st = c.bs.find(i => i.id === 'std')?.y24 || 0;
                      const isActive = key === activeCompany;
                      const Icon = c.icon;
                      return (
                        <tr key={key} className={`border-b border-border cursor-pointer hover:bg-background ${isActive ? 'bg-blue-50' : ''}`}
                          onClick={() => handleCompanyChange(key)}>
                          <td className="py-2 px-2 flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${COLOR_MAP[c.color].text}`} />
                            <span className={isActive ? 'font-semibold text-foreground' : 'text-foreground'}>{c.ticker}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-foreground">${rev.toLocaleString()}</td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-600">{(gross / rev * 100).toFixed(1)}%</td>
                          <td className="py-2 px-2 text-right font-mono text-blue-600">{(net / rev * 100).toFixed(1)}%</td>
                          <td className={`py-2 px-2 text-right font-mono ${(lt + st) / eq > 1.5 ? 'text-red-500' : 'text-foreground'}`}>{((lt + st) / eq).toFixed(2)}x</td>
                          <td className="py-2 px-2 text-right font-mono text-amber-600">{(net / eq * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Click a row to switch companies. Notice how tech (NVTK) has the highest margins, while retail (FMRT) has the highest revenue but thinnest margins.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════ INCOME STATEMENT ══════ */}
        <TabsContent value="income" className="mt-6 space-y-4">
          <div className={`${cm.light} border ${cm.border} rounded-xl p-4 text-sm ${cm.text} flex items-start gap-3`}>
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p><strong>Click any line item</strong> to learn what it means and why investors care. Viewing <strong>{co.name}</strong> — {co.desc}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CoIcon className={`w-4 h-4 ${cm.text}`} />
                      Income Statement — {co.ticker}
                    </h3>
                    <span className="text-xs text-muted-foreground">All figures in $M</span>
                  </div>
                  <ColumnHeader />
                  <div className="space-y-0.5">
                    {co.is.map(item => (
                      <StatementRow key={item.id} item={item} selectedId={selectedItem} onSelect={setSelectedItem} revenueBase={revenue24} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <ExplanationPanel selectedItem={selectedItem} />
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Margins — {co.ticker}</h4>
                  {[
                    { label: 'Gross Margin', value: metrics.gm, desc: 'Gross Profit ÷ Revenue' },
                    { label: 'Operating Margin', value: metrics.om, desc: 'EBIT ÷ Revenue' },
                    { label: 'Net Margin', value: metrics.nm, desc: 'Net Income ÷ Revenue' },
                  ].map((m, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <span className={`text-sm font-bold ${cm.text}`}>{m.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(parseFloat(m.value), 100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════ BALANCE SHEET ══════ */}
        <TabsContent value="balance" className="mt-6 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-500" />
            <p><strong>The Balance Sheet</strong> is a "snapshot" at a point in time. Viewing <strong>{co.name}</strong>. Golden rule: <strong>Assets = Liabilities + Equity</strong>.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CoIcon className={`w-4 h-4 ${cm.text}`} />
                      Balance Sheet — {co.ticker}
                    </h3>
                    <span className="text-xs text-muted-foreground">All figures in $M</span>
                  </div>
                  <ColumnHeader />
                  <div className="space-y-0.5">
                    {co.bs.map(item => (
                      <StatementRow key={item.id} item={item} selectedId={selectedItem} onSelect={setSelectedItem} revenueBase={null} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <ExplanationPanel selectedItem={selectedItem} />
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Ratios — {co.ticker}</h4>
                  {[
                    { label: 'Current Ratio', value: metrics.cr + 'x', warn: parseFloat(metrics.cr) < 1.0 },
                    { label: 'Debt/Equity', value: metrics.de + 'x', warn: parseFloat(metrics.de) > 1.5 },
                    { label: 'Return on Equity', value: metrics.roe + '%', warn: false },
                    { label: 'Return on Assets', value: metrics.roa + '%', warn: false },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{r.label}</span>
                      <span className={`text-sm font-bold ${r.warn ? 'text-red-500' : 'text-purple-600'}`}>{r.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════ CASH FLOW ══════ */}
        <TabsContent value="cashflow" className="mt-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
            <p><strong>Cash is king.</strong> Viewing <strong>{co.name}</strong>. The Cash Flow Statement shows actual cash movements — it can't be manipulated with accounting tricks.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CoIcon className={`w-4 h-4 ${cm.text}`} />
                      Cash Flow Statement — {co.ticker}
                    </h3>
                    <span className="text-xs text-muted-foreground">All figures in $M</span>
                  </div>
                  <ColumnHeader />
                  <div className="space-y-0.5">
                    {co.cf.map(item => (
                      <StatementRow key={item.id} item={item} selectedId={selectedItem} onSelect={setSelectedItem} revenueBase={null} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <ExplanationPanel selectedItem={selectedItem} />
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cash Flow by Category — {co.ticker}</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={cfCatData}>
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }} formatter={(v) => ['$' + v.toLocaleString() + 'M']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {cfCatData.map((_, i) => <Cell key={i} fill={cfColors[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Metrics — {co.ticker}</h4>
                  {[
                    { label: 'Operating Cash Flow', value: '$' + ocf24.toLocaleString() + 'M' },
                    { label: 'Free Cash Flow (OCF-CapEx)', value: '$' + metrics.fcf.toLocaleString() + 'M' },
                    { label: 'FCF Margin', value: (metrics.fcf / revenue24 * 100).toFixed(1) + '%' },
                    { label: 'OCF vs Net Income', value: (ocf24 / netinc24 * 100).toFixed(0) + '%' },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className="text-sm font-bold text-emerald-600">{m.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════ SANDBOX ══════ */}
        <TabsContent value="sandbox" className="mt-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex items-start gap-3">
            <Calculator className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <p><strong>Income Statement Simulator</strong> — Adjust the sliders to see how changing revenue, margins, and costs cascade down to the bottom line.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-5 space-y-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-600" /> Adjust Inputs
                </h3>
                {[
                  { label: 'Revenue', value: sbRev, set: setSbRev, min: 10000, max: 100000, step: 1000, fmt: (v) => '$' + v.toLocaleString() },
                  { label: 'Gross Margin', value: sbGM, set: setSbGM, min: 20, max: 90, step: 1, fmt: (v) => v + '%' },
                  { label: 'OpEx (% of Revenue)', value: sbOpex, set: setSbOpex, min: 5, max: 60, step: 1, fmt: (v) => v + '%' },
                  { label: 'Tax Rate', value: sbTax, set: setSbTax, min: 0, max: 40, step: 1, fmt: (v) => v + '%' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                      <span className="text-sm font-bold text-foreground">{s.fmt(s.value)}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                      onChange={e => s.set(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{s.fmt(s.min)}</span><span>{s.fmt(s.max)}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => { setSbRev(50000); setSbGM(60); setSbOpex(29); setSbTax(20); }}
                  className="text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset to Defaults
                </Button>
                {/* Quick presets from the 5 companies */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Or load a company's profile:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPANY_KEYS.map(key => {
                      const c = COMPANIES[key];
                      const rev = c.is.find(i => i.id === 'revenue')?.y24 || 50000;
                      const grs = c.is.find(i => i.id === 'gross')?.y24 || 0;
                      const opx = Math.abs(c.is.find(i => i.id === 'opex')?.y24 || 0);
                      const ptx = c.is.find(i => i.id === 'pretax')?.y24 || 1;
                      const tax = Math.abs(c.is.find(i => i.id === 'tax')?.y24 || 0);
                      const Icon = c.icon;
                      return (
                        <button key={key}
                          onClick={() => {
                            setSbRev(rev);
                            setSbGM(Math.round(grs / rev * 100));
                            setSbOpex(Math.round(opx / rev * 100));
                            setSbTax(Math.round(tax / ptx * 100));
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-background flex items-center gap-1 ${COLOR_MAP[c.color].text}`}>
                          <Icon className="w-3 h-3" /> {c.ticker}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Simulated Income Statement</h3>
                  <div className="space-y-1">
                    {[
                      { label: 'Revenue', value: sandbox.rev, bold: true, color: 'text-blue-700' },
                      { label: '− Cost of Revenue', value: -sandbox.cogs, indent: true, color: 'text-red-600' },
                      { label: 'Gross Profit', value: sandbox.gross, bold: true, color: 'text-emerald-700' },
                      { label: '− Operating Expenses', value: -sandbox.opex, indent: true, color: 'text-red-600' },
                      { label: 'Operating Income', value: sandbox.opinc, bold: true, color: sandbox.opinc >= 0 ? 'text-purple-700' : 'text-red-700' },
                      { label: '− Income Tax', value: -sandbox.tax, indent: true, color: 'text-red-600' },
                      { label: 'Net Income', value: sandbox.net, bold: true, color: sandbox.net >= 0 ? 'text-emerald-700' : 'text-red-700' },
                    ].map((r, i) => (
                      <div key={i} className={`flex justify-between items-center px-3 py-1.5 rounded ${r.bold ? 'bg-background' : ''}`}
                        style={{ marginLeft: r.indent ? 16 : 0 }}>
                        <span className={`text-sm ${r.bold ? 'font-semibold' : ''} text-foreground`}>{r.label}</span>
                        <span className={`text-sm font-mono ${r.bold ? 'font-semibold' : ''} ${r.color}`}>
                          ${fmt(r.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Gross Margin</p>
                      <p className="text-lg font-bold text-emerald-600">{(sandbox.gross / sandbox.rev * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Op. Margin</p>
                      <p className={`text-lg font-bold ${sandbox.opinc >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {(sandbox.opinc / sandbox.rev * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Margin</p>
                      <p className={`text-lg font-bold ${sandbox.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {(sandbox.net / sandbox.rev * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profit Cascade</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sbChart} layout="vertical" margin={{ left: 50 }}>
                      <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} width={45} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }} formatter={(v) => ['$' + Math.abs(v).toLocaleString() + 'M']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {sbChart.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {sandbox.opinc > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Operating Leverage Insight
                    </p>
                    <p className="text-xs text-amber-700">
                      Every <strong>$1,000M</strong> increase in revenue adds ~<strong>${((sbGM / 100 - sbOpex / 100) * (1 - sbTax / 100) * 1000).toFixed(0)}M</strong> to net income — a <strong>{((sbGM / 100 - sbOpex / 100) * (1 - sbTax / 100) * 100).toFixed(1)}%</strong> flow-through rate.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ══════ QUIZ ══════ */}
        <TabsContent value="quiz" className="mt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Test Your Knowledge
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{QUIZ.length} questions covering all three financial statements</p>
            </div>
            <div className="flex items-center gap-3">
              {quizScore.t > 0 && (
                <Badge variant="outline" className={`text-xs ${quizScore.c === quizScore.t ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                  {quizScore.c}/{quizScore.t} correct
                </Badge>
              )}
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { setQuizAnswers({}); setQuizRevealed({}); }}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {QUIZ.map((q, qi) => {
              const answered = quizRevealed[qi];
              const userAnswer = quizAnswers[qi];
              const isCorrect = userAnswer === q.a;

              return (
                <Card key={qi} className={answered ? (isCorrect ? 'border-emerald-200' : 'border-red-200') : ''}>
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-foreground mb-3">
                      <span className="text-muted-foreground mr-2">Q{qi + 1}.</span>{q.q}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.o.map((opt, oi) => {
                        let btnClass = 'border-border hover:border-blue-300 hover:bg-blue-50 text-foreground';
                        if (answered) {
                          if (oi === q.a) btnClass = 'border-emerald-400 bg-emerald-50 text-emerald-700';
                          else if (oi === userAnswer && !isCorrect) btnClass = 'border-red-400 bg-red-50 text-red-700';
                          else btnClass = 'border-border text-muted-foreground';
                        }
                        return (
                          <button key={oi} disabled={answered}
                            onClick={() => handleQuiz(qi, oi)}
                            className={`text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${btnClass} flex items-center gap-2`}>
                            {answered && oi === q.a && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {answered && oi === userAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {answered && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span className="font-semibold">{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</span>{' '}{q.x}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {quizScore.t === QUIZ.length && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-5 text-center">
                <Award className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                <h3 className="font-bold text-foreground text-lg">
                  {quizScore.c === QUIZ.length ? '🎉 Perfect Score!' : quizScore.c >= 6 ? '👏 Great Job!' : '📚 Keep Learning!'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You got <strong>{quizScore.c} out of {QUIZ.length}</strong> correct.
                  {quizScore.c < QUIZ.length && ' Review the explanations above and try the other tabs to strengthen your understanding.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}