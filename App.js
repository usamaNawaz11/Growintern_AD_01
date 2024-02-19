import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, PanResponder, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Audio } from 'expo-av';

const songs = [
  { id: 1, title: 'Song 1', source: require('./assets/song.mp3'), image: require('./assets/sham.png') },
  { id: 2, title: 'Song 2', source: require('./assets/shame.mp3'), image: require('./assets/indi.jpg') },
];

const App = () => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [panResponder, setPanResponder] = useState({});
  const [currentImage, setCurrentImage] = useState(songs[0].image);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    const { panHandlers } = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { width } = Dimensions.get('window');
        const newPosition = (gestureState.moveX / width) * duration;
        setPosition(newPosition);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { width } = Dimensions.get('window');
        const newPosition = (gestureState.moveX / width) * duration;
        seekSound(newPosition);
      },
    });

    setPanResponder(panHandlers);
  }, [duration]);

  const onPlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis);
  };
  

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      songs[currentSongIndex].source,
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );
    setSound(sound);
  };

  const playSound = async () => {
    if (!sound) {
      await loadSound();
    } else {
      await sound.playAsync();
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  const seekSound = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const nextSong = async () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentImage(songs[nextIndex].image);
    if (sound) {
      await sound.unloadAsync();
    }
    await loadSound(); // Load the new song
  };
  const previousSong = async () => {
    console.log('Before previous song - position:', position, 'duration:', duration);
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Ensures the index stays within bounds
    setCurrentSongIndex(prevIndex);
    setCurrentImage(songs[prevIndex].image);
    if (sound) {
      await sound.unloadAsync();
    }
    await loadSound(); // Load the new song
    setPosition(0); // Reset position to the start of the new song
    console.log('After previous song - position:', position, 'duration:', duration);
  };
  
  


  return (
    <View style={styles.container}>
      <Image source={currentImage} style={styles.img} />

      <View style={styles.controls}>
        <TouchableOpacity onPress={previousSong}>
          <Icon name="arrow-back-circle" size={50} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isPlaying ? pauseSound : playSound}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={50} />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextSong}>
          <Icon name="arrow-forward-circle" size={50} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressBar} {...panResponder}>
  {duration > 0 && (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex:  duration, backgroundColor: 'black', height: 20 }} />
    </View>
  )}
  <View style={styles.draggableHandle} />
</View>




    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey"

  },
  img: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
    width: 300,
    marginTop: 200,
    marginLeft: 60,
    borderRadius: 25
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Adjust spacing between buttons
    width: '70%', // Ensure the controls span the entire width
    marginBottom: 20,
    marginLeft: 70
  },
  progressBar: {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  draggableHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2f95dc',
    position: 'absolute',
    left: '100%',
    marginLeft: -10,
    top: 0,
  },
});

export default App;
