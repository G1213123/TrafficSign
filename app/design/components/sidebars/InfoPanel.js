'use client';

import React from 'react';
import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { Bug, Mail } from 'lucide-react';

export default function InfoPanel() {
    const { t } = useI18n();

    return (
        <div className="space-y-4 info-panel">
            <div className="input-group">
                <label className="input-label">{t('About')}</label>
                <p className="info-panel-quote">"{t("That's the way it is.")}"</p>
                <div className="info-panel-body">
                    <p>
                        {t('Road Sign Factory is a web-based application for designing, customizing, and exporting professional traffic signs. Create your own symbols, add text, borders, and route maps, then export your design in multiple formats.')}
                    </p>
                    <p>
                        {t("Sign designs are referring the Hong Kong Transport Department's")}{' '}
                        <a
                            href="https://www.td.gov.hk/en/publications_and_press_releases/publications/tpdm/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="info-panel-link"
                        >
                            {t('Transport Planning and Design Manual (TPDM)')}
                        </a>{' '}
                        {t('as closely as possible.')}
                    </p>

                    <p className="info-panel-version">{t('Version')}: 1.4.4</p>
                </div>
            </div>

            <div className="info-panel-beta">
                <p className="info-panel-beta-title">{t('BETA VERSION')}</p>
                <p className="info-panel-beta-body">
                    {t('This is an experimental version under active development. Features may be incomplete, unstable, or change without notice. Use for testing and evaluation purposes only.')}
                </p>
            </div>

            <div className="input-group info-panel-support">
                <p>
                    {t('To help support this project, you can buy me a coffee! Donations are much appreciated:')}
                </p>
                <a
                    href="https://www.buymeacoffee.com/G1213123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-panel-coffee-image-link"
                >
                    <img
                        src="https://cdn.buymeacoffee.com/buttons/default-blue.png"
                        alt={t('Buy Me a Coffee')}
                        className="info-panel-coffee-image"
                        width="174"
                        height="41"
                    />
                </a>
            </div>

            <div className="input-group info-panel-contact">
                <label className="input-label">{t('Contact')}</label>
                <p>{t('Contact Email')}: enquiry@roadsignfactory.hk</p>

                <div className="info-panel-link-grid">
                    <a href="mailto:enquiry@roadsignfactory.hk" className="info-panel-link-chip">
                        <Mail size={14} aria-hidden="true" />
                        <span>{t('Email')}</span>
                    </a>
                    <a
                        href="https://github.com/G1213123/TrafficSign"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-panel-link-chip"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            className="info-panel-social-icon"
                        >
                            <path
                                fill="currentColor"
                                d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.66 7.66 0 0 1 8 4.77c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                            />
                        </svg>
                        <span>{t('GitHub')}</span>
                    </a>
                    <a
                        href="https://github.com/G1213123/TrafficSign/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-panel-link-chip"
                    >
                        <Bug size={14} aria-hidden="true" />
                        <span>{t('Report Bug')}</span>
                    </a>
                </div>
            </div>

            <div className="info-panel-disclaimer">
                <h4>{t('Disclaimer')}</h4>
                <p>
                    {t('Fonts used are subject to their respective licenses: Transport fonts (Crown Copyright), Noto Sans HK and KR (SIL OFL), and Ministry of Education Standard Kai fonts (Version 5.00) (CC BY-ND).')}
                </p>
                <p>
                    {t('This site is not affiliated with the authorities and makes no guarantee of 100% conformity to official standards.')}
                </p>
                <p>
                    {t("It is the user's responsibility to ensure that the designs comply with local regulations and standards.")}
                </p>
                <p>
                    {t('The creator assumes no liability for any damages resulting from the use of this application or its outputs.')}
                </p>
            </div>
        </div>
    );
}