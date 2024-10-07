export const lightTheme = {
    page: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center' as 'center',
        justifyContent: 'center' as 'center',
        width: '100%',
    },
    container: {
        width: '100%',
        // maxWidth: '1200px',
        padding: '20px 50px',
        display: 'flex' as 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center' as 'center',
        transitions: 'all 0.3s ease',
    },
    cardContainer: {
        display: 'flex' as 'flex',
        justifyContent: 'space-between' as 'space-between',
        flexDirection: 'column' as 'column',
        width: '100%',
    },
    card: {
        position: 'relative' as 'relative',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        // height: '600px',
    },
    title: {
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#666',
        fontSize: '18px',
        marginBottom: '20px',
    },
    buttonPrimary: {
        backgroundColor: '#007BFF',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    icon: {
        width: '20px',
        height: '20px',
        color: '#000'
    },
    buttonContainer: {
        display: 'flex' as 'flex',
        gap: '10px',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
        marginTop: '20px',
    },
};

export const darkTheme = {
    ...lightTheme,
    title: {
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    icon: {
        width: '20px',
        height: '20px',
        color: '#fff'
    },
    card: {
        position: 'relative' as 'relative',
        backgroundColor: '#282828',
        color: '#fff',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        marginBottom: '20px',
        // height: '600px',
    },

    buttonPrimary: {
        backgroundColor: '#bb86fc',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px',
    },
};