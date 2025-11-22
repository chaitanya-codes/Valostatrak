module.exports = (map, key, field = null) => {
    if (!field) {
        const current = map.get(key) || 0;
        map.set(key, current + 1);
        return;
    }
    const obj = map.get(key) || {};
    obj[field] = (obj[field] || 0) + 1;
    map.set(key, obj);
};