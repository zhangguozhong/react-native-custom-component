# react-native-custom-component

简单封装的一些component，还有很多可以改进的地方。


## 如何使用

```javascript

import BaseScrollView from './Components/BaseScrollView'
import BaseFlatList from './Components/BaseFlatList'

//上拉加载更多
onLoadMoreRequest() {
        this.setState({isLoadingMore:true});
        let timer = setInterval(() => {
            let data = [].concat(this.state.data).concat(['2','3']);
            this.setState({data:data});
            this.setState({isLoadingMore:false, isLoadMoreComplete:true});
            clearInterval(timer);
        }, 3000);
    }

//渲染行信息
    renderItem(item, index) {
        return(
            <View key={index} style={styles.rowView}>
                <Text style={styles.text}>
                    {item.item}
                </Text>
            </View>
        )
    }

//下拉刷新
  onPullRequest(){
      this.setState({
          isLoadingMore:false,
          isPulling:true
      });
      let pullTimer = setInterval(()=>{
          this.setState({
              isPulling:false,
              isLoadMoreComplete:false
          });
          clearInterval(pullTimer);
      }, 3000);
  }
  
  
  <BaseFlatList
      style={styles.flatList}
      cellHeight={80}
      data={this.state.data}
      renderItem={this.renderItem}
      enablePull={true}
      enableLoadMore={true}
      isLoadingMore={this.state.isLoadingMore}
      isLoadMoreComplete={this.state.isLoadMoreComplete}
      onLoadMoreRequest={this.onLoadMoreRequest}
  >
  </BaseFlatList>

```
