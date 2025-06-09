// Add this utility function somewhere in your project
export const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Add this to get team initials
export const getTeamInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};