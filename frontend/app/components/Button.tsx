import { TouchableOpacity, Text } from "react-native";
import { styles } from "../constants/styles";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
}

export default function Button({ title, onPress, style }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}