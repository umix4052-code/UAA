
import React, { RefObject } from 'react';
import { LogViewer } from './components';
import { LogIcon, ErrorIcon } from './icons';
import { DetailedError, NotificationLogItem } from './types';

interface LogSectionProps {
    notificationLogRef: RefObject<HTMLDivElement>;
    errorLogRef: RefObject<HTMLDivElement>;
    notificationLog: NotificationLogItem[];
    setNotificationLog: (logs: NotificationLogItem[]) => void;
    errorLog: DetailedError[];
    setErrorLog: (logs: DetailedError[]) => void;
}

export const LogSection: React.FC<LogSectionProps> = ({
    notificationLogRef, errorLogRef, notificationLog, setNotificationLog, errorLog, setErrorLog
}) => {
    return (
        <div className="logs-container">
            <LogViewer ref={notificationLogRef} title="Notification Log" icon={<LogIcon/>} logs={notificationLog} onClear={() => setNotificationLog([])} type="notification" />
            <LogViewer ref={errorLogRef} title="Error Log" icon={<ErrorIcon/>} logs={errorLog} onClear={() => setErrorLog([])} type="error" />
        </div>
    );
};
