import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';

export default function TabOneScreen() {
  return (
    <View className={'flex-1 items-center justify-center'}>
      <Text className={'text-xl font-bold'}>Tab One</Text>
      <View className={'my-7 h-[1px] w-4/5'} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.jsx" />
    </View>
  );
}
