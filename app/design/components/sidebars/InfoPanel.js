'use client';

import React from 'react';
import { useI18n } from '../../lib/i18n/I18nProvider.js';

export default function InfoPanel() {
    const { t } = useI18n();
    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">{t('project_info')}</label>
                <div style={{ color: '#ddd', lineHeight: 1.55, fontSize: '13px' }}>
                    {t('project_info_description')}
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">{t('migrated_panels')}</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.6 }}>
                    {t('migrated_panels_description')}
                </div>
            </div>
        </div>
    );
}