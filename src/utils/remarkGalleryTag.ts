export default function remarkGalleryTag() {
  return (tree: any) => {
    function visit(node: any) {
      if (node && node.type === "html" && typeof node.value === "string") {
        node.value = node.value
          .replace(/<\s*Gallery\b([^>]*)\/?>/gi, (_, attrs) =>
            `<gallery${attrs}></gallery>`
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
