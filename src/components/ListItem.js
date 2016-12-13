import React from 'react'
import {Image, TouchableWithoutFeedback, TouchableOpacity, View, Animated, Dimensions, Platform, WebView, StyleSheet, ScrollView, Text, BackAndroid} from 'react-native'

class ListItem extends React.Component {
  constructor(props) {
    super(props)

    const scroll = new Animated.Value(0)
    const scrollListenerId = scroll.addListener(({value}) => {props.setScroll(value)})

    this.state = {
      openStatus: false,
      open: new Animated.Value(0),
      scroll,
      height: new Animated.Value(150),
      scrollListenerId
    }

    BackAndroid.addEventListener('hardwareBackPress', () => this.backAndroid())
  }

  componentWillUnmount() {
    const {scroll, scrollListenerId} = this.state
    scroll.removeListener(scrollListenerId)
    BackAndroid.removeEventListener('hardwareBackPress', () => this.backAndroid())
  }

  backAndroid() {
    if (this.state.openStatus) {
      this.toggle()
      return true
    }
    return false
  }

  toggle() {
    const {currentScroll, scrollLength} = this.props.getScroll()
    this._ref.measureInWindow((x, y) => {
      const {scroll, height, open, openStatus} = this.state
      this.props.setScrollEnabled(openStatus)

      scroll.setValue(currentScroll)

      const screenHeight = Dimensions.get('window').height

      let heightGoal, dScroll

      if (openStatus) {
        heightGoal = 150
        dScroll = 0 - (screenHeight/2 - 75)
      } else {
        heightGoal = screenHeight
        dScroll = y
      }

      let scrollGoal = Math.max(currentScroll + dScroll, 0)
      if (openStatus) scrollGoal = Math.min(scrollGoal, scrollLength - screenHeight * 2 + 150 + (Platform.OS === 'ios' ? 20 : 0))

      const animation = Animated.parallel([
        Animated.timing(scroll, {toValue: scrollGoal}),
        Animated.timing(height, {toValue: heightGoal}),
        Animated.timing(open, {toValue: openStatus ? 0 : 1})
      ])

      if (openStatus) {
        animation.start(() => {this.setState({openStatus: false})})
      } else {
        this.setState({openStatus: true})
        animation.start()
      }
    })
  }

  render() {
    const {images, id, url, name, author} = this.props
    const {open, height, openStatus} = this.state
    const {width} = Dimensions.get('window')

    return (
      <View style={styles.container} collapsable={false} ref={ref => {this._ref = ref}}>
        <TouchableOpacity onPress={() => {this.toggle()}}>
          <Animated.Image
            style={{width, height}}
            source={{uri: images[0].url}}
          >
            <View style={styles.frame} collapsable={false}>
              <Text style={styles.name}>{name.toUpperCase()}</Text>
              <Text style={styles.author}>{author}</Text>
            </View>
          </Animated.Image>
        </TouchableOpacity>
        {openStatus &&
          <Animated.View
            style={[
              styles.webView,
              {
                opacity: open.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [0, 0, 1]
                }),
              }
            ]}
          >
            <WebView
              style={styles.container}
              source={{uri: `https://500px.com${url}`}}
            />
            <Text onPress={() => {this.toggle()}} style={styles.closeButton}>Close</Text>
          </Animated.View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {flex: 1},
  webView: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  closeButton: {
    backgroundColor: 'rgb(255, 255, 255)',
    position: 'absolute',
    left: 16,
    top: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgb(0, 0, 0)'
  },
  name: {
    position: 'absolute',
    top: 16,
    left: 16,
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'transparent',
    fontSize: 20
  },
  author: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    color: 'rgb(255, 255, 255)',
    fontWeight: 'bold',
    backgroundColor: 'transparent'
  },
  frame: {
    margin: 8,
    borderColor: 'rgb(255, 255, 255)',
    borderWidth: 1,
    flex: 1
  }
})

export default ListItem
