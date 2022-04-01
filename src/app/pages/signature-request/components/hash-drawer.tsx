import { Stack, Flex, Box, Text } from '@stacks/ui';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

interface ShowHashButtonProps {
  expanded: boolean;
}
const ShowHashButton = (props: ShowHashButtonProps) => {
  const { expanded } = props;
  return <Box as={expanded ? FiChevronDown : FiChevronUp} mr="tight" size="20px" />;
};

interface HashDrawerProps {
  hash: string;
}

export function HashDrawer(props: HashDrawerProps): JSX.Element | null {
  const { hash } = props;
  const [showHash, setShowHash] = useState(false);
  const [displayHash, setDisplayHash] = useState(hash);
  return (
    <Stack py="tight" px="tight" spacing="loose">
      <Flex marginBottom="0px !important">
        <Text display="block" fontSize={0}>
          {showHash ? 'Hide hash' : 'Show hash'}
        </Text>
        <Box
          _hover={{ cursor: 'pointer' }}
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            setDisplayHash(showHash ? '' : hash);
            setShowHash(!showHash);
          }}
        >
          <ShowHashButton expanded={showHash} />
        </Box>
      </Flex>
      <Box
        transition="all 0.65s cubic-bezier(0.23, 1, 0.32, 1)"
        py={showHash ? 'tight' : 'none'}
        height={showHash ? '100%' : '0'}
        visibility={showHash ? 'visible' : 'hidden'}
      >
        <Stack spacing="base-tight">
          <Text
            display="block"
            color="#74777D"
            fontSize={2}
            fontWeight={500}
            lineHeight="1.6"
            wordBreak="break-all"
            fontFamily={'Fira Code'}
          >
            {displayHash}
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
}
