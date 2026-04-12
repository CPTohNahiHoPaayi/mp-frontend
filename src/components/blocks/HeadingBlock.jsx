import { Heading, Box, Flex, Text } from "@chakra-ui/react";

// Rotating color palette — each heading gets a unique accent
const ACCENT_PALETTE = [
  { bar: "var(--accent)", bg: "rgba(var(--accent-rgb),0.06)", text: "var(--accent)" },   // teal
  { bar: "#7C3AED", bg: "rgba(var(--purple-rgb),0.06)", text: "#A78BFA" },   // purple
  { bar: "#3B82F6", bg: "rgba(var(--blue-rgb),0.06)", text: "#60A5FA" },   // blue
  { bar: "#F59E0B", bg: "rgba(var(--warning-rgb),0.06)", text: "#FBBF24" },   // amber
  { bar: "#EC4899", bg: "rgba(var(--pink-rgb),0.06)", text: "#F472B6" },   // pink
  { bar: "#10B981", bg: "rgba(var(--accent-light-rgb),0.06)", text: "#818CF8" },   // emerald
];

const HeadingBlock = ({
  level = 4,
  text,
  align = "left",
  margin = 6,
  index = 0,
}) => {
  const accent = ACCENT_PALETTE[index % ACCENT_PALETTE.length];

  if (level <= 2) {
    return (
      <Box w="full" mb={margin} mt={10}>
        <Box h="1px" bg="var(--border-base)" mb={6} />
        <Box
          bg={accent.bg}
          borderLeft="4px solid"
          borderColor={accent.bar}
          rounded="lg"
          roundedLeft="none"
          px={5}
          py={4}
        >
          <Heading
            as={`h${level}`}
            fontSize={level === 1 ? { base: "2xl", md: "3xl" } : { base: "xl", md: "2xl" }}
            color="var(--text-primary)"
            fontWeight={level === 1 ? "800" : "700"}
            lineHeight="1.35"
            letterSpacing="-0.02em"
            textAlign={align}
            wordBreak="break-word"
          >
            {text}
          </Heading>
        </Box>
      </Box>
    );
  }

  // h3-h6: simpler but still colored
  return (
    <Box w="full" mb={margin} mt={6}>
      <Flex align="center" gap={3}>
        <Box
          w="8px"
          h="8px"
          rounded="full"
          bg={accent.bar}
          flexShrink={0}
        />
        <Heading
          as={`h${level}`}
          fontSize={level === 3 ? { base: "lg", md: "xl" } : "md"}
          color={accent.text}
          fontWeight="600"
          lineHeight="1.4"
          textAlign={align}
          wordBreak="break-word"
        >
          {text}
        </Heading>
      </Flex>
    </Box>
  );
};

export default HeadingBlock;
