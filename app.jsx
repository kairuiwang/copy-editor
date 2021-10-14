// @flow
/**
 * Editable content area for rich text formatting that converts the formatted
 * text into a JSON representation of the text.
 */
import * as React from 'react';
import ContentEditable from 'react-contenteditable';
import JSONPretty from 'react-json-pretty';
import ReactHtmlParser from 'react-html-parser';
import styled from 'styled-components';

import Colors from './constants/colors';
import Spacing from './constants/spacing';

const parseNodes = (nodes, baseStyle = 'normal') => {
	let parsed = [];
	for (const node of nodes) {
		const { attribs, children, data, name, style } = node;
		if (!name) {
			parsed = parsed.concat({
				style: baseStyle,
				content: data,
			});
		} else if (name === 'b') {
			parsed = parsed.concat(parseNodes(children, (baseStyle = 'bold')));
		} else if (name === 'i') {
			parsed = parsed.concat(parseNodes(children, (baseStyle = 'italic')));
		} else if (name === 'span') {
			const { style } = attribs;
			console.log(style);
			const [bold, bolder, boldest, italic] = [
				'700;',
				'800;',
				'900;',
				'italic',
			];
			let isItalic;
			let isBold;
			style.includes(bold || bolder || boldest)
				? (isBold = true)
				: (isBold = false);
			style.includes(italic) ? (isItalic = true) : (isItalic = false);
			isItalic && !isBold
				? (parsed = parsed.concat(parseNodes(children, 'italic')))
				: !isItalic && isBold
				? (parsed = parsed.concat(parseNodes(children, 'bold')))
				: isItalic && isBold
				? (parsed = parsed.concat(parseNodes(children, 'bold-italic')))
				: (parsed = parsed.concat(parseNodes(children, 'normal')));
		}
	}
	return parsed;
};

const parseHtml = (html) =>
	ReactHtmlParser(html, {
		transform: (node, i) => {
			const { children, name, parent } = node;
			if (!parent && name === 'div') {
				const parsed = parseNodes(children);
				return parsed.length > 0
					? {
							content: parsed,
					  }
					: null;
			} else {
				return null;
			}
		},
	}).filter((node) => !!node);

const App = () => {
	const [html, setHtml] = React.useState('<div>Edit text here.</div>');
	const [parsed, setParsed] = React.useState(parseHtml(html));

	const handleChange = (e) => {
		setHtml(e.target.value);
	};

	React.useEffect(() => {
		const parsedHtml = parseHtml(html);
		setParsed(parsedHtml);
	}, [html]);

	return (
		<Wrapper>
			<ContentEditable
				html={html}
				onChange={handleChange}
				style={{
					flex: 1,
					maxWidth: '50vw',
					fontSize: '17px',
					fontFamily: 'sans-serif',
					fontWeight: 300,
					lineHeight: '24px',
					height: '100vh',
					borderRight: `1px solid ${Colors.offBlack}`,
					padding: `${Spacing.small}px`,
				}}
			/>
			<Strut size={24} />
			<JSONPretty
				data={parsed}
				style={{
					flex: 1,
					overflowX: 'scroll',
				}}
			/>
		</Wrapper>
	);
};

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	width: 100%;
`;

const Strut = styled.div`
	flex-basis: ${(props) => props.size}px;
`;

export default App;
