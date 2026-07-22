/**
 * Fetches GitHub contribution data and renders it as ASCII art.
 *
 * Uses the public GitHub GraphQL API to get the contribution calendar
 * for a given username. No authentication required for public profiles.
 *
 * To use a different username, change the GITHUB_USERNAME env var or
 * edit the default below.
 */

interface ContributionDay {
	contributionCount: number;
	date: string;
}

interface ContributionWeek {
	contributionDays: ContributionDay[];
}

interface ContributionCalendar {
	weeks: ContributionWeek[];
}

interface GraphQLResponse {
	data: {
		user: {
			contributionCalendar: ContributionCalendar;
		};
	};
}

const USERNAME = process.env.GITHUB_USERNAME || 'jakemaly';

async function fetchContributions(): Promise<ContributionDay[]> {
	const query = `
		query {
			user(login: "${USERNAME}") {
				contributionCalendar {
					weeks {
						contributionDays {
							contributionCount
							date
						}
					}
				}
			}
		}
	`;

	const token = process.env.GITHUB_TOKEN;

	const response = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token && { Authorization: `Bearer ${token}` }),
		},
		body: JSON.stringify({ query }),
	});

	if (!response.ok) {
		console.warn(
			`[github-contributions] Failed to fetch contributions: ${response.status} ${response.statusText}. Using empty data.`
		);
		return [];
	}

	const json: GraphQLResponse = await response.json();

	if (json.data?.user?.contributionCalendar?.weeks) {
		return json.data.user.contributionCalendar.weeks.flatMap((week) =>
			week.contributionDays
		);
	}

	return [];
}

/**
 * Renders contribution days as a 7-row × N-column ASCII grid.
 * Each cell is one of: ' ' (none), '░' (low), '▒' (mid), '▓' (high), '█' (very high).
 */
export async function renderContributionsAscii(): Promise<string> {
	const days = await fetchContributions();

	if (days.length === 0) {
		return '';
	}

	// Determine thresholds based on the data
	const counts = days.map((d) => d.contributionCount);
	const max = Math.max(...counts, 1);
	const q75 = counts.toSorted((a, b) => a - b)[Math.floor(counts.length * 0.75)] || 1;
	const q50 = counts[Math.floor(counts.length * 0.5)] || 1;
	const q25 = counts[Math.floor(counts.length * 0.25)] || 1;

	const charForCount = (count: number): string => {
		if (count === 0) return ' ';
		if (count >= q75) return '█';
		if (count >= q50) return '▓';
		if (count >= q25) return '▒';
		return '░';
	};

	// Organize into weeks (columns) × days of week (rows)
	type Week = { days: (ContributionDay | null)[] };
	const weeks: Week[] = [];
	let currentWeek: Week = { days: [] };

	for (const day of days) {
		currentWeek.days.push(day);
		if (currentWeek.days.length === 7) {
			weeks.push(currentWeek);
			currentWeek = { days: [] };
		}
	}
	if (currentWeek.days.length > 0) {
		while (currentWeek.days.length < 7) {
			currentWeek.days.push(null);
		}
		weeks.push(currentWeek);
	}

	// Limit to last ~52 weeks for readability
	const displayWeeks = weeks.slice(-52);

	const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const lines: string[] = [];

	// Header
	lines.push('');
	lines.push('  contributions');
	lines.push('  ┌' + '─'.repeat(displayWeeks.length * 2) + '┐');

	// Grid rows
	for (let row = 0; row < 7; row++) {
		const label = dayLabels[row] || '';
		let rowStr = `  ${label}`;
		for (const week of displayWeeks) {
			const day = week.days[row];
			const ch = day ? charForCount(day.contributionCount) : ' ';
			rowStr += ch;
		}
		lines.push(rowStr);
	}

	// Footer
	lines.push('  └' + '─'.repeat(displayWeeks.length * 2) + '┘');
	lines.push('');

	return lines.join('\n');
}

/**
 * Returns a simple text summary: total contributions, streak, etc.
 */
export async function getContributionSummary(): Promise<{
	total: number;
	years: number;
}> {
	const days = await fetchContributions();
	const total = days.reduce((sum, d) => sum + d.contributionCount, 0);
	const dates = days.map((d) => new Date(d.date));
	const years = new Set(dates.map((d) => d.getFullYear()));

	return { total, years: years.size };
}
