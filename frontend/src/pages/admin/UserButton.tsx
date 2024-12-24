import { Group, Text, UnstyledButton } from "@mantine/core";
import classes from "./UserButton.module.css";

export function UserButton() {
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            Museum Restaurant
          </Text>

          <Text c="dimmed" size="xs">
            museumrestaurant@google.com
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}
