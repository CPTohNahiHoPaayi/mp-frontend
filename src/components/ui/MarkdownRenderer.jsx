import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Text, Link, Table } from '@chakra-ui/react';
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
            <Text as="h1" fontSize="2xl" fontWeight="bold" color="blue.300" mt={6} mb={3}>
              {children}
            </Text>
          ),
          h2: ({ children }) => (
            <Text as="h2" fontSize="xl" fontWeight="bold" color="blue.300" mt={5} mb={2}>
              {children}
            </Text>
          ),
          h3: ({ children }) => (
            <Text as="h3" fontSize="lg" fontWeight="semibold" color="blue.200" mt={4} mb={2}>
              {children}
            </Text>
          ),
          h4: ({ children }) => (
            <Text as="h4" fontSize="md" fontWeight="semibold" color="blue.200" mt={3} mb={1}>
              {children}
            </Text>
          ),
          p: ({ children }) => (
            <Text color="gray.200" fontSize="md" lineHeight="1.8" mb={3}>
              {children}
            </Text>
          ),
          strong: ({ children }) => (
            <Text as="span" fontWeight="bold" color="#89b4fa">
              {children}
            </Text>
          ),
          em: ({ children }) => (
            <Text as="span" fontStyle="italic" color="gray.300">
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link href={href} color="blue.400" textDecoration="underline" target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
          ul: ({ children }) => (
            <Box as="ul" pl={6} mb={3} sx={{ listStyleType: 'disc' }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box as="ol" pl={6} mb={3} sx={{ listStyleType: 'decimal' }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Box as="li" color="gray.200" fontSize="md" lineHeight="1.8" mb={1}>
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box
              borderLeft="3px solid"
              borderColor="blue.500"
              pl={4}
              py={1}
              my={3}
              bg="gray.800"
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
                bg="gray.700"
                color="#f9e2af"
                px={1.5}
                py={0.5}
                rounded="md"
                fontSize="sm"
                fontFamily="Fira Code, monospace"
                {...props}
              >
                {children}
              </Text>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => (
            <Box borderBottom="1px solid" borderColor="gray.700" my={4} />
          ),
          table: ({ children }) => (
            <Box overflowX="auto" my={4}>
              <Box as="table" w="full" borderCollapse="collapse">
                {children}
              </Box>
            </Box>
          ),
          thead: ({ children }) => (
            <Box as="thead" bg="gray.800">
              {children}
            </Box>
          ),
          tbody: ({ children }) => <Box as="tbody">{children}</Box>,
          tr: ({ children }) => (
            <Box as="tr" borderBottom="1px solid" borderColor="gray.700">
              {children}
            </Box>
          ),
          th: ({ children }) => (
            <Box as="th" px={3} py={2} textAlign="left" fontSize="sm" fontWeight="semibold" color="blue.300">
              {children}
            </Box>
          ),
          td: ({ children }) => (
            <Box as="td" px={3} py={2} fontSize="sm" color="gray.200">
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
