import React from 'react'
import {ListView, Platform} from 'react-native'
import ListItem from './ListItem'

class Root extends React.Component {
  constructor() {
    super()
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id})
    rawData = []
    this.state = {
      ds,
      rawData,
      dataSource: ds.cloneWithRows(rawData),
      scrollEnabled: true
    }
  }

  componentDidMount() {
    //request to 500px
    const {ds, rawData} = this.state
    fetch('https://api.500px.com/v1/photos?feature=popular&consumer_key=aZpXAf1VvAL2X3liedKMHa2SN8QZBvRMo73b2i9z&image_size=440')
    .then(result => result.json())
    .then(data => {
      if (Array.isArray(data.photos)) {
        const newData = [...rawData]
        data.photos.forEach(photo => newData.push({
          id: photo.id,
          name: photo.name,
          images: photo.images,
          author: photo.user.fullname,
          height: photo.height,
          width: photo.height,
          url: photo.url
        }))

        this.setState({
          rawData: newData,
          dataSource: ds.cloneWithRows(newData)
        })
      }
    })
  }

  setScroll(y) {
    if (this._ref) this._ref.scrollTo({y, animated: false})
  }

  getScroll() {
    if (this._ref) return ({
      currentScroll: this._ref.scrollProperties.offset,
      scrollLength: this._ref.scrollProperties.contentLength
    })
  }

  render() {
    const {dataSource, scrollEnabled} = this.state
    return(
      <ListView
        dataSource={dataSource}
        renderRow={rowData => <ListItem
          {...rowData}
          setScroll={value => this.setScroll(value)}
          getScroll={() => this.getScroll()}
          setScrollEnabled={status => this.setState({scrollEnabled: status})}
        />}
        style={{marginTop: Platform.OS === 'ios' ? 20 : 0}}
        ref={ref => {this._ref = ref}}
        scrollEnabled={scrollEnabled}
      />
    )
  }
}

export default Root
