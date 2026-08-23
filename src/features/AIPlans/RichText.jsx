/*
 * Minimal, dependency-free markdown-ish renderer for AI
 * chat bubbles. Supports what the LLM actually emits:
 * - **bold** segments
 * - "- " / "* " bullet lines and "1." numbered lines
 *   (grouped into lists)
 * - plain line breaks
 * Everything else renders as plain text — never raw HTML.
 */
import styles from "./AIPlans.module.css";

const BOLD_PATTERN = /\*\*([^*]+)\*\*/g;

function renderInline(text) {
    const parts = [];
    let lastIndex = 0;
    let match;

    BOLD_PATTERN.lastIndex = 0;

    while ((match = BOLD_PATTERN.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(
                text.slice(lastIndex, match.index)
            );
        }

        parts.push(
            <strong key={`b-${match.index}`}>
                {match[1]}
            </strong>
        );

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

function isBullet(line) {
    return /^[-•*]\s+/.test(line.trim());
}

function isNumbered(line) {
    return /^\d+[.)]\s+/.test(line.trim());
}

function stripMarker(line) {
    return line.trim().replace(/^([-•*]|\d+[.)])\s+/, "");
}

function RichText({ text }) {
    if (!text) {
        return null;
    }

    const lines = String(text).split("\n");

    const blocks = [];

    let listBuffer = [];
    let listType = null;

    function flushList() {
        if (listBuffer.length === 0) {
            return;
        }

        const items = listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
        ));

        blocks.push(
            listType === "ordered" ? (
                <ol key={blocks.length}>{items}</ol>
            ) : (
                <ul key={blocks.length}>{items}</ul>
            )
        );

        listBuffer = [];
        listType = null;
    }

    lines.forEach((rawLine) => {
        const line = rawLine.trimEnd();

        if (isBullet(line)) {
            if (listType === "ordered") {
                flushList();
            }

            listType = listType || "bullet";
            listBuffer.push(stripMarker(line));
            return;
        }

        if (isNumbered(line)) {
            if (listType === "bullet") {
                flushList();
            }

            listType = listType || "ordered";
            listBuffer.push(stripMarker(line));
            return;
        }

        flushList();

        if (line.trim() === "") {
            return;
        }

        blocks.push(
            <p className={styles.richParagraph} key={blocks.length}>
                {renderInline(line)}
            </p>
        );
    });

    flushList();

    return <div className={styles.richText}>{blocks}</div>;
}

export default RichText;
