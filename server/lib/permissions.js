module.exports = {
    permissions: {
        LOGIN: 0,
        REGISTER: 1,
        GETAUTHTOKEN: 2,
        GETMEASUREMENTS: 3,
        GETSTATIONS: 4,
        GETTYPES: 5,
        ROOT: 6,
        SUBMITMEASUREMENT: 7,
        USERINFO: 8,
        USERSTATIONS: 9,
        CREATESTATION: 10,
        DELETEOWNSTATION: 11,
        DELETEANYSTATION: 12,
        EDITOWNSTATION: 13,
        EDITANYSTATION: 14,
        LOGOUTANYUSER: 15,
        SEEANYUSER: 16,
        EDITANYUSER: 17,
        SEEADMINPANEL: 18,
        EDITANYSESSION: 19,
        SEETHELOGS: 20
    },
    groups: [
        {
            name: 'Guest',
            level: 0,
            permissions: 0
        },
        {
            name: 'User',
            level: 1,
            permissions: 0
        },
        {
            name: 'Moderator',
            level: 2,
            permissions: 0
        },
        {
            name: 'Admin',
            level: 3,
            permissions: 4194304
        }
    ]
}