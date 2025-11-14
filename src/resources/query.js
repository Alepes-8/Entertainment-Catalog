class dataRequest {
    constructor(id, title, country, genre, platform, year) {
        this.query = {
            id: id || null,
            title: title || null,
            country: country || null,
            genre: genre || null,
            platform: platform || null,
            year: year || null
        };
    }

    getQuery() {
        return this.query;
    }
};