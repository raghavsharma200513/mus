import { useState } from "react";
import { Box, Collapse, Group, UnstyledButton } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react"; // Import icons from lucide-react
import classes from "./NavbarLinksGroup.module.css";

interface LinksGroupProps {
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
}

export function LinksGroup({
  label,
  initiallyOpened,
  links,
  link,
}: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (hasLinks) {
      setOpened((o) => !o);
    } else if (link) {
      navigate(link);
    }
  };

  const items = (hasLinks ? links : []).map((link) => (
    <Link to={link.link} className={classes.link} key={link.label}>
      {link.label}
    </Link>
  ));

  return (
    <>
      <UnstyledButton onClick={handleClick} className={classes.control}>
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks ? (
            <Box>
              {opened ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </Box>
          ) : null}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
