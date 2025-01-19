function calcSymbol(type, length) {
    
    const symbols = {
        'StackArrow': [ // TPDM Diagram 3.5.5.12
            { x: 0, y: 0, label: 'V1' },
            { x: length * 4, y: length * 4, label: 'V2' },
            { x: length * 4, y: length * 8, label: 'V3' },
            { x: length * 4 / 3, y: length * 16 / 3, label: 'V4' },
            { x: length * 4 / 3, y: length * 16, label: 'V5' },
            { x: - length * 4 / 3, y: length * 16, label: 'V6' },
            { x: - length * 4 / 3, y: length * 16 / 3, label: 'V7' },
            { x: - length * 4, y: length * 8, label: 'V8' },
            { x: - length * 4, y: length * 4, label: 'V9' },
        ],

        'GantryArrow': [ // TPDM Diagram 3.5.6.4
            { x: 0, y: 0, label: 'V1' },
            { x: length * 3, y: 0, label: 'V2' },
            { x: length * 3, y: length * 4, label: 'V3' },
            { x: length * 9, y: length * 4, label: 'V4' },
            { x: 0, y: length * 8, label: 'V5' },
            { x: - length * 9, y: length * 4, label: 'V6' },
            { x: - length * 3, y: length * 4, label: 'V7' },
            { x: - length * 3, y: length * 0, label: 'V8' },
        ],
    }

    return symbols[type]
}