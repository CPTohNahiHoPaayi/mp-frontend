import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Text, Link } from '@chakra-ui/react';
import CodeBlock from '../blocks/CodeBlock';

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <Box
      className="markdown-renderer"
      sx={{
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-child': { mb: 0 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Text as="h1" fontSize="2xl" fontWeight="700" color="#E2E8F0" mt={8} mb={3}>
              {children}
            </Text>
          ),
          h2: ({ children }) => (
            <Text as="h2" fontSize="xl" fontWeight="700" color="#E2E8F0" mt={6} mb={3}>
              {children}
            </Text>
          ),
          h3: ({ children }) => (
            <Text as="h3" fontSize="lg" fontWeight="600" color="#CBD5E0" mt={5} mb={2}>
              {children}
            </Text>
          ),
          h4: ({ children }) => (
            <Text as="h4" fontSize="md" fontWeight="600" color="#CBD5E0" mt={4} mb={2}>
              {children}
            </Text>
          ),
          p: ({ children }) => (
            <Text color="#A0AEC0" fontSize="md" lineHeight="1.85" mb={4}>
              {children}
            </Text>
          ),
          strong: ({ children }) => (
            <Text as="span" fontWeight="600" color="#E2E8F0">
              {children}
            </Text>
          ),
          em: ({ children }) => (
            <Text as="span" fontStyle="italic" color="#A0AEC0">
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link href={href} color="#00C9A7" textDecoration="underline" textDecorationColor="rgba(0,201,167,0.3)" _hover={{ textDecorationColor: '#00C9A7' }} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
          ul: ({ children }) => (
            <Box as="ul" pl={5} mb={4} sx={{
              listStyleType: 'none',
              '& > li': {
                position: 'relative',
                pl: 3,
                _before: {
                  content: '"•"',
                  position: 'absolute',
                  left: 0,
                  color: '#00C9A7',
                  fontWeight: 'bold',
                },
              },
            }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box as="ol" pl={5} mb={4} sx={{
              listStyleType: 'decimal',
              '& > li::marker': { color: '#00C9A7' },
            }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Box as="li" color="#A0AEC0" fontSize="md" lineHeight="1.85" mb={1.5}>
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box
              borderLeft="3px solid"
              borderColor="#00C9A7"
              pl={4}
              py={2}
              my={4}
              bg="rgba(0,201,167,0.04)"
              rounded="md"
            >
              {children}
            </Box>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeStr = String(children).replace(/\n$/, '');

            if (match) {
              return <CodeBlock code={codeStr} language={match[1]} />;
            }

            return (
              <Text
                as="code"
                bg="rgba(0,201,167,0.08)"
                color="#00C9A7"
                px={1.5}
                py={0.5}
                rounded="md"
                fontSize="sm"
                fontFamily="'Fira Code', monospace"
                {...props}
              >
                {children}
              </Text>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => (
            <Box borderBottom="1px solid" borderColor="#1C2030" my={6} />
          ),
          table: ({ children }) => (
            <Box overflowX="auto" my={4}>
              <Box as="table" w="full" borderCollapse="collapse">
                {children}
              </Box>
            </Box>
          ),
          thead: ({ children }) => (
            <Box as="thead" bg="rgba(0,201,167,0.04)">
              {children}
            </Box>
          ),
          tbody: ({ children }) => <Box as="tbody">{children}</Box>,
          tr: ({ children }) => (
            <Box as="tr" borderBottom="1px solid" borderColor="#1C2030">
              {children}
            </Box>
          ),
          th: ({ children }) => (
            <Box as="th" px={3} py={2} textAlign="left" fontSize="sm" fontWeight="600" color="#E2E8F0">
              {children}
            </Box>
          ),
          td: ({ children }) => (
            <Box as="td" px={3} py={2} fontSize="sm" color="#A0AEC0">
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
