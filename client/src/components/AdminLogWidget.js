import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { convertToEST } from '../utils/dateUtils';

const AdminLogWidget = ({ limit = 5 }) => {
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLogs();
  }, []);

  const fetchAdminLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching admin logs:', error);
      } else {
        setAdminLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Recent Admin Activity
        </h3>
      </div>
      <div className="px-6 py-4">
        {adminLogs.length === 0 ? (
          <div className="text-center py-6">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No admin logs yet</p>
            <p className="text-gray-400 text-xs mt-1">Run ADMIN_LOG_SETUP.sql to initialize</p>
          </div>
        ) : (
          <div className="space-y-3">
            {adminLogs.map((log) => (
              <div
                key={log.log_id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${log.action_type === 'portfolio_added' || log.action_type === 'user_added'
                    ? 'bg-green-500'
                    : log.action_type === 'portfolio_deleted' || log.action_type === 'user_deleted'
                      ? 'bg-red-500'
                      : log.action_type === 'system_alert'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900">{log.admin_name}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${log.action_type === 'portfolio_added' || log.action_type === 'user_added'
                        ? 'bg-green-100 text-green-700'
                        : log.action_type === 'portfolio_deleted' || log.action_type === 'user_deleted'
                          ? 'bg-red-100 text-red-700'
                          : log.action_type === 'system_alert'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                      {log.action_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 break-words">{log.action_description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogWidget;
