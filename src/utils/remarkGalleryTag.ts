interface MarkdownNode {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
}

export default function remarkGalleryTag() {
  return (tree: MarkdownNode) => {
    function visit(node: MarkdownNode) {
      if (node && node.type === "html" && typeof node.value === "string") {
        node.value = node.value
          .replace(
            /<\s*Gallery\b([^>]*)\/?>/gi,
            (_: string, attrs: string) => `<gallery${attrs}></gallery>`
          )
          .replace(/<\s*\/\s*Gallery\s*>/gi, "</gallery>");
      }

      if (node && Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child);
        }
      }
    }

    visit(tree);
  };
}
