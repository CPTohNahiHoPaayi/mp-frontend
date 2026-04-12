import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Box, Text, Link, Flex } from '@chakra-ui/react';
import CodeBlock from '../blocks/CodeBlock';

function preprocessMath(text) {
  if (!text) return text;
  // Convert \(...\) to $...$  and  \[...\] to $$...$$
  return text
    .replace(/\\\((.+?)\\\)/g, (_, m) => `$${m}$`)
    .replace(/\\\[(.+?)\\\]/gs, (_, m) => `$$${m}$$`)
    // Also handle (expression) patterns that look like display math
    .replace(/\(\\displaystyle\s+(.+?)\)/g, (_, m) => `$$${m}$$`);
}

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;
  const processed = preprocessMath(content);

  return (
    <Box
      className="markdown-renderer"
      sx={{
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-child': { mb: 0 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <Text as="h1" fontSize="2xl" fontWeight="700" color="#E2E8F0" mt={8} mb={3}
              borderBottom="2px solid" borderColor="rgba(0,201,167,0.2)" pb={2}
            >
              {children}
            </Text>
          ),
          h2: ({ children }) => (
            <Text as="h2" fontSize="xl" fontWeight="700" color="#E2E8F0" mt={6} mb={3}
              borderBottom="1px solid" borderColor="#1C2030" pb={2}
            >
              {children}
            </Text>
          ),
          h3: ({ children }) => (
            <Flex as="h3" align="center" gap={2} mt={5} mb={2}>
              <Box w="6px" h="6px" rounded="full" bg="#7C3AED" flexShrink={0} />
              <Text fontSize="lg" fontWeight="600" color="#A78BFA">{children}</Text>
            </Flex>
          ),
          h4: ({ children }) => (
            <Text as="h4" fontSize="md" fontWeight="600" color="#60A5FA" mt={4} mb={2}>
              {children}
            </Text>
          ),
          p: ({ children }) => (
            <Text color="#C4CDD8" fontSize="md" lineHeight="1.9" mb={4}>
              {children}
            </Text>
          ),
          strong: ({ children }) => (
            <Text as="span" fontWeight="600" color="#F0F4F8">
              {children}
            </Text>
          ),
          em: ({ children }) => (
            <Text as="span" fontStyle="italic" color="#8BB8D0">
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <Link href={href} color="#00C9A7" fontWeight="500" textDecoration="underline" textDecorationColor="rgba(0,201,167,0.3)" _hover={{ textDecorationColor: '#00C9A7', color: '#34D399' }} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
          ul: ({ children }) => (
            <Box as="ul" pl={1} mb={4} ml={2}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box as="ol" pl={1} mb={4} ml={2} sx={{
              counterReset: 'item',
              listStyleType: 'none',
              '& > li': {
                counterIncrement: 'item',
                _before: {
                  content: 'counter(item) "."',
                  color: '#F59E0B',
                  fontWeight: '700',
                  fontSize: 'sm',
                  mr: 2,
                  minW: '20px',
                  display: 'inline-block',
                },
              },
            }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Flex as="li" color="#C4CDD8" fontSize="md" lineHeight="1.9" mb={2} align="flex-start">
              <Box
                as="span"
                w="6px"
                h="6px"
                rounded="full"
                bg="#00C9A7"
                mt="10px"
                mr={3}
                flexShrink={0}
              />
              <Box flex={1}>{children}</Box>
            </Flex>
          ),
          blockquote: ({ children }) => (
            <Box
              borderLeft="4px solid"
              borderColor="#7C3AED"
              pl={5}
              py={3}
              my={5}
              bg="rgba(124,58,237,0.06)"
              rounded="md"
              roundedLeft="none"
              sx={{ '& p': { color: '#A78BFA', mb: 0 } }}
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
                bg="rgba(245,158,11,0.1)"
                color="#FBBF24"
                px={1.5}
                py={0.5}
                rounded="md"
                fontSize="0.85em"
                fontFamily="'Fira Code', monospace"
                fontWeight="500"
                {...props}
              >
                {children}
              </Text>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => (
            <Flex align="center" my={8}>
              <Box flex={1} h="1px" bg="#1C2030" />
              <Box mx={3}>
                <Box w="6px" h="6px" rounded="full" bg="#00C9A7" />
              </Box>
              <Box flex={1} h="1px" bg="#1C2030" />
            </Flex>
          ),
          table: ({ children }) => (
            <Box overflowX="auto" my={5} rounded="lg" border="1px solid" borderColor="#1C2030">
              <Box as="table" w="full" borderCollapse="collapse">
                {children}
              </Box>
            </Box>
          ),
          thead: ({ children }) => (
            <Box as="thead" bg="rgba(59,130,246,0.06)">
              {children}
            </Box>
          ),
          tbody: ({ children }) => <Box as="tbody">{children}</Box>,
          tr: ({ children }) => (
            <Box as="tr" borderBottom="1px solid" borderColor="#1C2030" _hover={{ bg: 'rgba(255,255,255,0.02)' }}>
              {children}
            </Box>
          ),
          th: ({ children }) => (
            <Box as="th" px={4} py={2.5} textAlign="left" fontSize="sm" fontWeight="600" color="#60A5FA">
              {children}
            </Box>
          ),
          td: ({ children }) => (
            <Box as="td" px={4} py={2.5} fontSize="sm" color="#C4CDD8">
              {children}
            </Box>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
