import { Breadcrumb, Menu, Portal, Box } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";
import { Link } from "react-router-dom";
import { Tooltip } from "@/components/ui/tooltip";

const MAX_LABEL_LENGTH = 40;

const truncate = (text) =>
  text.length > MAX_LABEL_LENGTH ? text.slice(0, MAX_LABEL_LENGTH) + "…" : text;

const BreadcrumbMenuItem = ({ label = "", items = [], isCurrent = false, tooltip }) => {
  const displayText = truncate(label || "Untitled");

  return (
    <Breadcrumb.Item isTruncated>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Box
            as="button"
            display="inline-flex"
            alignItems="center"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontWeight={isCurrent ? "bold" : "medium"}
            fontSize={isCurrent ? "20px" : "22px"}
            color={isCurrent ? "white" : "gray.300"}
            cursor="pointer"
            bg="transparent"
            border="none"
            px={0}
          >
            <Tooltip
              content={tooltip || label}
              isDisabled={!tooltip && label.length <= MAX_LABEL_LENGTH}
            >
              <Box as="span" display="inline-flex" alignItems="center">
                {displayText}
                <Box as={LuChevronDown} ml={1} />
              </Box>
            </Tooltip>
          </Box>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner placement="bottom-start">
            <Menu.Content zIndex={20}>
              {items.map((item) => (
                <Menu.Item key={item.value} asChild>
                  <Link to={item.value}>{item.label}</Link>
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Breadcrumb.Item>
  );
};

export { BreadcrumbMenuItem };
