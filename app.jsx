// @flow
/**
 * Editable content area for rich text formatting that converts the formatted
 * text into a JSON representation of the text.
 */
import * as React from "react";
import ContentEditable from "react-contenteditable";
import JSONPretty from "react-json-pretty";
import ReactHtmlParser from "react-html-parser";
import styled from "styled-components";

import Colors from "./constants/colors";
import Spacing from "./constants/spacing";

const labelStyle = ({ bold, italic }) => {
    if (bold && italic) return "bold-italic";
    else if (bold) return "bold";
    else if (italic) return "italic";
    else return "normal";
};

const contentsAreItalic = (node, startsItalic) => {
    const { attribs, name } = node;
    const style = attribs && attribs.style;
    const styledItalic = !!(style && style.match(/style:italic/));
    const styledNormal = !!(style && style.match(/style:normal/));
    const italicElements = ["i", "em"]

    // explicit style attrib (either italic or normal) overrides default
    // element style of current node, or any style inherited from a parent
    if (styledItalic) return true;
    else if (styledNormal) return false;

    // if no explicit style, check if we're in a default-italic element
    else if (italicElements.includes(name)) return true;

    // if neither, inherit style from parent
    else return startsItalic;
};

const contentsAreBold = (node, startsBold) => {
    const { attribs, name } = node;
    const style = attribs && attribs.style;
    // consider weights 500-1000 bold, as well as "bold" and "bolder" keywords
    const weightedBold = !!(style && style.match(/weight:([5-9][0-9][0-9]|1000|bold)/));

    // consider weights 100-499 normal, as well as "normal" and "lighter" keywords
    // technically weights 1-99 are valid, but I'm ignoring them for now because they make
    // the style parsing more complex and I've never actually seen them used in the wild
    const weightedNormal = !!(style && style.match(/weight:([1-4][0-9][0-9]|normal|lighter)/));
    const boldElements = ["b", "strong", "h1", "h2", "h3", "h4", "h5", "h6", "th"];

    if (weightedBold) return true;
    else if (weightedNormal) return false;
    else if (boldElements.includes(name)) return true;
    else return startsBold;
};

const parseNodes = (nodes, appliedStyle = { bold: false, italic: false }) => {
    let parsed = [];
    for (const node of nodes) {
        const { children, data } = node;
        const newStyle = {
            italic: contentsAreItalic(node, appliedStyle.italic),
            bold: contentsAreBold(node, appliedStyle.bold),
        };

        if (data) {
            const trimmedContent = data.trim();
            if (!!trimmedContent) {
                parsed = parsed.concat({
                    style: labelStyle(newStyle),
                    content: trimmedContent,
                });
            }
        } else if (children) {
            parsed = parsed.concat(parseNodes(children, newStyle));
        }
    }
    return parsed;
};

const parseHtml = (html) =>
    ReactHtmlParser(html, {
        transform: (node, i) => {
            const parsed = parseNodes([node]);
            return parsed.length > 0
                ? {
                        content: parsed,
                    }
                : null;
        },
    }).filter((node) => !!node);

const App = () => {
    const [html, setHtml] = React.useState("<div>Edit text here.</div>");
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
                    maxWidth: "50vw",
                    fontSize: "17px",
                    fontFamily: "sans-serif",
                    fontWeight: 300,
                    lineHeight: "24px",
                    height: "100vh",
                    borderRight: `1px solid ${Colors.offBlack}`,
                    padding: `${Spacing.small}px`,
                }}
            />
            <Strut size={24} />
            <JSONPretty
                data={parsed}
                style={{
                    flex: 1,
                    overflowX: "scroll",
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
