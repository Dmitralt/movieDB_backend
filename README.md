# Culture Arc Backend

Backend service for the Culture Arc project.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# test coverage
npm run test:cov
```

## API Endpoints

### Movies

```
GET    /movies           - Get list of movies (with pagination)
GET    /movies/search    - Search movies (with pagination)
GET    /movies/:id       - Get movie by ID
POST   /movies           - Create new movie
PATCH  /movies/:id       - Update movie (requires version)
DELETE /movies/:id       - Delete movie (requires version)
```

### Files

```
GET    /files/:filename  - Get file
POST   /files           - Upload file
```

### Query Parameters

- Pagination: `skip` and `limit` (default: 0 and 10)
- Search: `query` (search string)
- Version: `version` (for update and delete operations)

