export function link(title, href) {
	return `[${ title }](${href})`;
}

export function code(rows, language = 'text') {
	return [
		'```' + language,
		...rows,
		'```',
	].join('\n');
}
