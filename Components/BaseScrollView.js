
import React, { Component } from 'react'
import  {
    ScrollView,
    View,
    Text,
    RefreshControl,
    StyleSheet
}  from 'react-native'

import PropTypes from 'prop-types'

let STATUS_LOAD_MORE_IDLE = 1, //可以加载更多
    STATUS_LOADING_MORE = 2; //正在加载中

let DEFAULT_HEIGHT = 60;

export default class BaseScrollView extends Component {

    size = {};
    contentSize = {};

    static propTypes = {
      enablePull:PropTypes.bool,//是否允许下拉重新加载
      enableLoadMore:PropTypes.bool,//是否允许上拉加载更多

      isPulling:PropTypes.bool,//是否正在重新加载
      isLoadingMore:PropTypes.bool,//是否正在上拉加载更多

      isLoadMoreComplete:PropTypes.bool,//是否加载完成

      onPullRequest:PropTypes.func,//下拉回调函数
      onLoadMoreRequest:PropTypes.func//上拉加载更多回调函数
    };
    static defaultProps = {
      enablePull:false,
      enableLoadMore:false,
        isPulling:false,
        isLoadingMore:false,
        isLoadMoreComplete:false,
        onPullRequest:null,
        onLoadMoreRequest:null
    };

    constructor(props){
        super(props);
        this.onLoadMoreRequest = this.onLoadMoreRequest.bind(this);
        this.renderBottomLoadView = this.renderBottomLoadView.bind(this);
        this.onLayout = this.onLayout.bind(this);
        this.onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
        this.onHandleScroll = this.onHandleScroll.bind(this);
        this.resetView = this.resetView.bind(this);

        this.state={
            shouldBeLoadMore:false,
            status:STATUS_LOAD_MORE_IDLE
        }
    }

    componentWillReceiveProps(nextProps){
        if (!nextProps.isLoadMoreComplete){
            this.setState({
                status:STATUS_LOAD_MORE_IDLE
            });
        }
    }

    /**
     * 渲染重新加载组件
     * @returns {*}
     */
    renderRefreshControl(){
        if (this.props.enablePull){
            return (
                <RefreshControl
                    refreshing={this.props.isPulling}
                    onRefresh={this.props.onPullRequest}
                    title={'重新加载'}
                    tintColor={'gray'}
                    titleColor={'red'}
                    colors={['#ff0000', '#00ff00', '#0000ff']}
                    progressBackgroundColor={'white'}
                />
            )
        }else {
            return null;
        }
    }

    /**
     * 渲染上拉加载更多组件
     * @returns {*}
     */
    renderBottomLoadView() {
        let status = this.state.status;
        if (this.props.enableLoadMore) {
            let message = '';
            if (this.props.isLoadMoreComplete){
                message = (this.contentSize && this.contentSize.height <= DEFAULT_HEIGHT)?'暂无数据':'已显示全部内容';
                return (
                    <View style={styles.bottomView}>
                        <Text style={styles.text}>{message}</Text>
                    </View>
                )
            }else if(this.state.shouldBeLoadMore)
            {
                message = this.props.isLoadingMore?'正在加载中...':'上拉加载更多';
                if (status === STATUS_LOAD_MORE_IDLE) {
                    return (
                        <View style={styles.bottomView}>
                            <Text style={styles.text}>{message}</Text>
                        </View>
                    )
                }else if (status === STATUS_LOADING_MORE) {
                    return (
                        <View style={styles.bottomView}>
                            <Text style={styles.text}>{message}</Text>
                        </View>
                    )
                }else
                {
                    return null;
                }
            }else
            {
                return null;
            }
        }else {
            return null;
        }
    }

    /**
     * view开始拖动时触发
     * @param event
     */
    onScrollBeginDrag(event){
        let nativeEvent = event.nativeEvent;
        if (this.props.enableLoadMore && !this.props.isLoadingMore && !this.props.isLoadMoreComplete) {
            let status = this.state.status;
            let offsetY = nativeEvent.contentInset.top + nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y - nativeEvent.contentSize.height;
            if (offsetY>=-1 && offsetY<=1){
                if (this.state.shouldBeLoadMore && status === STATUS_LOAD_MORE_IDLE) {
                    this.onLoadMoreRequest();
                }
            }
        }
    }

    onHandleScroll(event){
        if (this.props.onScroll){
            this.props.onScroll(event);
        }

        if (this.props.enableLoadMore && !this.props.isLoadMoreComplete && !this.props.isLoadingMore) {
            let nativeEvent = event.nativeEvent;
            let status = this.state.status;
            if (!nativeEvent.contentInset || status !== STATUS_LOAD_MORE_IDLE){
                return;
            }

            let offsetY = nativeEvent.contentInset.top + nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y - nativeEvent.contentSize.height;
            if (offsetY>=-1 && offsetY<=1){
                if (this.state.shouldBeLoadMore && status === STATUS_LOAD_MORE_IDLE){
                    this.onLoadMoreRequest();
                }
            }
        }
    }

    /**
     * 上拉加载更多
     */
    onLoadMoreRequest() {
        this.setState({
            status:STATUS_LOADING_MORE
        });
        if (this.props.onLoadMoreRequest){
            this.props.onLoadMoreRequest();
        }
    }


    onLayout(event){
        let layout = event.nativeEvent.layout;
        this.size = {width:layout.width, height:layout.height};
        this.resetView(this.size, this.contentSize);
    }

    /**
     * 用于判断当前是否可以上拉加载更多
     * @param size 组件大小
     * @param contentSize 内容大小
     */
    resetView(size, contentSize) {
        let offsetY = size.height - contentSize.height;
        if (offsetY < 0) {
            this.setState({
                shouldBeLoadMore:true
            });
        }else
        {
            this.setState({
                shouldBeLoadMore:false
            });
        }
    }

    render() {
        return (
            <ScrollView
                contentContainerStyle={[styles.contentContainer, this.props.contentContainerStyle]}
                ref={scrollView => this.scrollView = scrollView}
                refreshControl={this.renderRefreshControl()}
                onScrollBeginDrag={this.onScrollBeginDrag}
                onScroll={this.onHandleScroll}
                onLayout={this.onLayout}
                scrollEventThrottle={3}
                onContentSizeChange={(contentWidth, contentHeight) => {
                    this.contentSize = {width:contentWidth, height:contentHeight};
                    this.resetView(this.size, this.contentSize);
                }}
            >
                {this.props.children}
                {this.renderBottomLoadView()}
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    bottomView:{
        height:DEFAULT_HEIGHT,
        justifyContent:'center',
        alignItems:'center'
    },
    text:{
        color:'gray'
    },
    contentContainer:{
        backgroundColor:'white'
    }
});