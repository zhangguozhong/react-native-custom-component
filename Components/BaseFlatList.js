/**
 * Created by user on 2018/7/11
 */

import React, { Component } from 'react'
import {
    RefreshControl,
    View,
    Text,
    FlatList,
    StyleSheet
} from 'react-native'

import PropTypes from 'prop-types'

let DEFAULT_BOTTOM_HEIGHT = 60;
let STATUS_LOAD_MORE_IDLE = 1, STATUS_LOADING_MORE = 2;

export default class BaseFlatList extends Component {

    size = {};
    contentSize = {};
    static propTypes = {
        data:PropTypes.array,
        cellHeight:PropTypes.number, //行高

        enablePull:PropTypes.bool, //是否允许下拉刷新
        enableLoadMore:PropTypes.bool, //是否允许上拉加载

        isPulling:PropTypes.bool, //是否正在刷新
        isLoadingMore:PropTypes.bool, //是否正在加载更多
        isLoadMoreComplete:PropTypes.bool, //是否加载完成

        onPullRequest:PropTypes.func, //下拉刷新回调
        onLoadMoreRequest:PropTypes.func, //上拉加载更多回调

        initialNumToRender:PropTypes.number, //首次加载数据条数,
        renderItem:PropTypes.func
    };
    static defaultProps = {
        data:[],

        enablePull:false,
        enableLoadMore:false,

        isPulling:false,
        isLoadingMore:false,
        isLoadMoreComplete:false,

        onPullRequest:null,
        onLoadMoreRequest:null,

        initialNumToRender:20,
        renderItem:null
    };

    constructor(props){
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.onLoadMoreRequest = this.onLoadMoreRequest.bind(this);
        this.onLayout = this.onLayout.bind(this);
        this.resetView = this.resetView.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this._onEndReached = this._onEndReached.bind(this);

        this.state={
            dataSource:this.props.data,
            status:STATUS_LOAD_MORE_IDLE,
            shouldBeLoadMore:false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            dataSource:nextProps.data
        });
        if (!nextProps.isLoadingMore) {
            this.setState({status:STATUS_LOAD_MORE_IDLE});
        }
    }

    /**
     * 渲染下拉刷新组件
     * @returns {*}
     */
    renderRefreshControl() {
        if (this.props.enablePull){
            return (
                <RefreshControl
                    refreshing={this.props.isPulling}
                    onRefresh={this.props.onPullRequest}
                    title={'重新加载'}
                    tintColor={'gray'}
                    titleColor={'red'}
                    colors={['gray']}
                    progressBackgroundColor={'white'}
                >
                </RefreshControl>
            )
        }else
        {
            return null;
        }
    }

    renderBottomLoadView() {
        let message = '';
        let status = this.state.status;
        if (this.props.enableLoadMore){
            if (this.props.isLoadMoreComplete){
                message = (this.contentSize && this.contentSize.height <= DEFAULT_BOTTOM_HEIGHT)?'暂无数据':'已显示全部内容';
                return (
                    <View style={styles.bottomView}>
                        <Text style={styles.text}>{message}</Text>
                    </View>
                )
            }else if (this.state.shouldBeLoadMore)
            {
                message = this.props.isLoadingMore?'正在加载中...':'上拉加载更多';
                if (status === STATUS_LOAD_MORE_IDLE){
                    return (
                        <View style={styles.bottomView}>
                            <Text style={styles.text}>{message}</Text>
                        </View>
                    )
                }else if (status === STATUS_LOADING_MORE){
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
     * 渲染底部上拉加载更多组件
     * @returns {*}
     */
    renderFooter() {
        return this.renderBottomLoadView();
    }

    /**
     * 渲染行内容
     * @param item 当前行数据
     * @param index 当前行index
     */
    renderItem(item, index) {
        if (this.props.renderItem) {
            this.props.renderItem(item, index);
        }else
        {
            return null;
        }
    }

    onLoadMoreRequest() {
        this.setState({
            status:STATUS_LOADING_MORE
        });
        if (this.props.onLoadMoreRequest) {
            this.props.onLoadMoreRequest();
        }
    }

    /**
     * 上拉加载更多
     * @private
     */
    _onEndReached() {
        if (this.props.enableLoadMore) {
            if (this.props.data.length === 0){
                return;
            }

            let status = this.state.status;
            if (!this.props.isLoadMoreComplete && this.state.shouldBeLoadMore && status===STATUS_LOAD_MORE_IDLE) {
                this.onLoadMoreRequest();
            }
        }
    }

    onLayout(event) {
        let layout = event.nativeEvent.layout;
        this.size = {width:layout.width, height:layout.height};
        this.resetView(this.size, this.contentSize);
    }

    /**
     * 判断是否可以上拉加载更多
     * @param size
     * @param contentSize
     */
    resetView(size, contentSize) {
        if (size&&contentSize) {
            let offsetY = size.height - contentSize.height;
            if (offsetY < 0){
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
    }

    render() {
        return (
            <FlatList
                ref={(flatList) => this.flatList = flatList}
                initialNumToRender={this.props.initialNumToRender}
                data={this.state.dataSource}
                renderItem={this.renderItem}
                refreshControl={this.renderRefreshControl()}
                keyExtractor={(item, index) => item + index}
                ListFooterComponent={this.renderFooter}
                onEndReachedThreshold={0.1}
                onLayout={this.onLayout}
                onContentSizeChange={(contentWidth, contentHeight) => {
                    this.contentSize = {width:contentWidth, height:contentHeight};
                    this.resetView(this.size, this.contentSize);
                }}
                onEndReached={this._onEndReached}
                getItemLayout={(data, index) => {
                    return {length:this.props.cellHeight || DEFAULT_BOTTOM_HEIGHT, offset:(this.props.cellHeight || DEFAULT_BOTTOM_HEIGHT) * index, index};
                }}
                ItemSeparatorComponent={() => {
                    return(
                        <View style={styles.separatorItem}>
                        </View>
                    )
                }}
                {...this.props}
                style={[styles.flatList, this.props.style]}
            >
            </FlatList>
        )
    }
}

const styles = StyleSheet.create({
    flatList:{
        backgroundColor:'gray'
    },
    bottomView:{
        minHeight:DEFAULT_BOTTOM_HEIGHT,
        justifyContent:'center',
        alignItems:'center'
    },
    text:{
        color:'red'
    },
    separatorItem:{
        marginHorizontal:15,
        height:1,
        backgroundColor:'blue'
    }
});

