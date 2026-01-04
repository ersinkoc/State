import { CodeBlock as CodeshinBlock } from '@oxog/codeshine/react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  highlightLines?: (number | string)[];
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  filename,
  highlightLines,
  showLineNumbers = true,
  showCopyButton = true,
  className
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();

  // Sync codeshine theme with app theme
  const codeTheme = resolvedTheme === 'dark' ? 'github-dark' : 'github-light';

  return (
    <div className={cn(
      "my-4 rounded-xl overflow-hidden border border-border shadow-sm",
      className
    )}>
      <CodeshinBlock
        code={code.trim()}
        language={language}
        theme={codeTheme}
        lineNumbers={showLineNumbers}
        highlightLines={highlightLines as string[] | undefined}
        filename={filename}
        copyButton={showCopyButton}
        showLanguageBadge={false}
        className="rounded-xl"
      />
    </div>
  );
}
