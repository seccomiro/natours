module.exports = class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObject[el]);

    const queryString = JSON.stringify(queryObject).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryObject = JSON.parse(queryString);

    // let query = Tour.find(queryObject);
    this.query = this.query.find(queryObject);
    return this;
  }

  sort() {
    let sortBy = '-createdAt';
    if (this.queryString.sort) {
      const sortByFields = this.queryString.sort.split(',').join(' ');
      sortBy = `${sortByFields} ${sortBy}`;
    }
    this.query = this.query.sort(sortBy);
    return this;
  }

  fields() {
    const fields = this.queryString.fields ? this.queryString.fields.split(',').join(' ') : '-__v';
    this.query = this.query.select(fields);
    return this;
  }

  paginate() {
    const limit = parseInt(this.queryString.limit || 5, 10);
    const page = parseInt(this.queryString.page || 1, 10);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
