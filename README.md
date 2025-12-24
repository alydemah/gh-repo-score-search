# GitHub Repository Search & Scoring API

A Node.js + TypeScript application that searches GitHub repositories and ranks them using a simple scoring algorithm based on popularity and recency.

## Features

- Search public GitHub repositories
- Optional filtering by programming language and creation date
- Repository ranking using a weighted scoring algorithm
- Pagination with GitHub Search API constraints enforced
- Fully typed, testable, and extensible design

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Yarn (v4)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alydemah/gh-repo-score-search.git
    cd gh-repo-score-search
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables (Optional):
   Create a `.env` file in the root directory and add your GitHub Personal Access Token:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```

### Running the Application

To start the application in development mode, run:

```bash
yarn dev
```

The server will start on `http://localhost:3000` by default.

### API Usage

Send a GET request to the `/repositories` endpoint with the following query parameters:

- `language` (string, optional): Filter by programming language.
- `createdAfter` (string, optional): Filter repositories created after this date (YYYY-MM-DD).
- `page` (number, optional): Page number for pagination (default: 1).
- `perPage` (number, optional): Number of results per page (max: 100, default: 30).
- `sort` (string, optional): Sort field. Can be one of `stars`, `forks`, `help-wanted-issues`, or `updated`. Default is `stars`.
- `order` (string, optional): Sort order. Can be either `asc` or `desc`. Default is `desc`.

Example request:

```http
GET /repositories?q=typescript&language=JavaScript&createdAfter=2020-12-24&page=1&perPage=20
```

## Scoring Algorithm

Repositories are ranked using a weighted scoring model based on three independent signals:

### 1 Stars (Popularity) Signal (55%)

Stars measure general popularity.

To prevent extremely popular repositories from dominating the ranking, stars are scaled logarithmically:

```
stars_score = log10(1 + stars)
```

This ensures:

- diminishing returns for very large repositories
- smoother score distribution

### 2 Forks (Community Engagement) Signal (25%)

Forks indicate how often a repository is reused or extended.

Forks use the same logarithmic scaling as stars:

```
forks_score = log10(1 + forks)
```

This captures engagement without over-weighting large projects.

### 3 Recency (Freshness) Signal (20%)

Recency measures how recently a repository was updated.

```
recency_score = 1 / (1 + days_since_last_update / 30)
```

- Recently updated repositories score higher
- The score decays smoothly over time
  A 30-day window acts as a soft “half-life”

The final score is calculated as:

```txt
final_score =
  0.55 × stars_score +
  0.25 × forks_score +
  0.20 × recency_score
```

The raw score is normalized to a 0–100 scale and capped at 100.

Extensible Design: new signals can be added without modifying the core scoring logic.

## Testing

To run the test suite, use:

```bash
yarn test
```

## GitHub API Limitations

- Unauthenticated requests are heavily rate-limited.
- Authenticated requests allow significantly higher limits (recommended).

## Project Structure

```
src/
 ├─ routes/        # API routes
 ├─ services/      # GitHub API & scoring logic
 ├─ scoring/       # Scoring signals and algorithm
 ├─ types/         # Shared TypeScript types
 └─ tests/         # Unit tests
```

## Scalability & Trade-offs

This implementation is designed for clarity and correctness.

For larger-scale usage, the following improvements could be applied:

- **Caching**: Cache GitHub API responses to reduce rate limits and latency.
- **Async processing**: Pre-compute scores or rank results asynchronously for large result sets.
- **Configurable weights**: Move scoring weights to configuration for A/B testing.
- **Persistence**: Store scored repositories to avoid recomputation.
- **Parallel requests**: Distribute search queries across multiple criteria to bypass API constraints.
