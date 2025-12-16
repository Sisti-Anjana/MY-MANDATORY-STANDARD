/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HourlyCoverageChart = ({ issues, portfolios = [] }) => {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}${dd}${yyyy}`;
  };
  const inputToISO = (val) => {
    if (!val) return '';
    const m = val.replace(/\D/g, '').match(/^(\d{2})(\d{2})(\d{4})$/);
    if (!m) return '';
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  const chartData = useMemo(() => {
    // Filter issues based on date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredIssues = issues;
    
    if (dateRange === 'today') {
      filteredIssues = issues.filter(issue => {
        const issueDate = new Date(issue.created_at);
        issueDate.setHours(0, 0, 0, 0);
        return issueDate.getTime() === today.getTime();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredIssues = issues.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= weekAgo;
      });
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filteredIssues = issues.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= monthAgo;
      });
    } else if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredIssues = issues.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= start && issueDate <= end;
      });
    }

    // Calculate coverage by hour
    const totalPortfolios = portfolios.length || 1; // Use actual portfolio count, avoid division by zero
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourIssues = filteredIssues.filter(issue => issue.issue_hour === hour);
      const uniquePortfolios = new Set(hourIssues.map(issue => issue.portfolio_name));
      const coverage = (uniquePortfolios.size / totalPortfolios) * 100;
      
      return {
        hour: `${hour}:00`,
        coverage: Math.round(coverage * 10) / 10,
        portfoliosChecked: uniquePortfolios.size,
        totalIssues: hourIssues.length
      };
    });

    return hourlyData;
  }, [issues, portfolios, dateRange, startDate, endDate]);

  const totalPortfolios = portfolios.length || 1;
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded border">
          <p className="font-semibold">{data.hour}</p>
          <p className="text-green-600">Coverage: {data.coverage}%</p>
          <p className="text-sm text-gray-600">Portfolios: {data.portfoliosChecked}/{totalPortfolios}</p>
          <p className="text-sm text-gray-600">Total Count: {data.totalIssues}</p>
        </div>
      );
    }
    return null;
  };

  const getDateRangeDisplay = () => {
    const today = new Date();
    if (dateRange === 'custom' && startDate && endDate) {
      return `${startDate} to ${endDate}`;
    } else if (dateRange === 'today') {
      return today.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return `${weekAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return `${monthAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`;
    }
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Hourly Coverage Analysis</h2>
      <p className="text-sm text-gray-600 mb-4">
        Portfolio risk distribution analysis based on temporal coverage theory
      </p>

      {/* Date Range Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              dateRange === 'today'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              dateRange === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              dateRange === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateRange('custom');
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateRange('custom');
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="text-sm text-gray-600">
            Showing data for: <span className="font-semibold">{getDateRangeDisplay()}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Portfolio Risk Distribution by Hour</h3>
        <p className="text-xs text-gray-600 mb-4">
          Visual representation of systemic risk concentration across the 24-hour cycle
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.coverage === 0 ? '#ef4444' : entry.coverage < 50 ? '#f59e0b' : '#76AB3F'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyCoverageChart;
