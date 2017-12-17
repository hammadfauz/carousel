import palette from './palette';
import React from 'react';

class Indicator extends React.Component{
  constructor (props) {
    super(props);
  }
  render () {
    var styles = {
      main : {
        'width' : '13px',
        'height' : '13px',
        'borderRadius' : '50%',
        'backgroundColor' : this.props.stack === 'CENTER'?
          palette.yellow:palette.grey,
        'transition' : 'all 300ms ease-in-out',
        'display' : 'inline-block',
        'margin' : '0px 6px',
        'cursor' : 'pointer'
      }
    };
    return (<div onClick={this.props.onClick} style={styles.main}></div>);
  }
};

class CarouselItem extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      container : null
    };
    this.setRef = this.setRef.bind(this);
    this.reportHeight = this.reportHeight.bind(this);
  }
  componentDidMount () {
    window.addEventListener('resize',this.reportHeight);
  }
  setRef (ref) {
    this.state.container = ref;
    this.setState(this.state,this.reportHeight);
  }
  reportHeight () {
    if (typeof this.props.onHeightChange === 'function' &&
        this.state.container)
      this.props.onHeightChange(this.state.container.clientHeight);
  }
  render () {
    var styles = {
      main : {
        'transition' : 'opacity 300ms cubic-bezier(0.87, 0.01, 0.9, 0.1),transform 300ms ease-in-out',
        'transform' : this.props.stack === 'LEFT'?
          'translate(-100%,0px)' : this.props.stack === 'RIGHT' ?
            'translate(100%,0px)' : 'translate(0px,0px)',
        'opacity' : this.props.stack !== 'CENTER'?'0':'1',
        'position' : this.props.stack === 'CENTER'?'relative':'absolute',
        'top' : '0px',
        'float' : 'left'
      }
    };
    return (<div ref={this.setRef}
      style={styles.main}>
      {this.props.children}
    </div>);
  }
};

class Carousel extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      stackIds : [],
      current : 0,
      timerId : -1,
      minHeight : 0
    };
    this.pause = this.pause.bind(this);
    this.unpause = this.unpause.bind(this);
    this.setNext = this.setNext.bind(this);
    this.setPrev = this.setPrev.bind(this);
    this.handleHeightChange = this.handleHeightChange.bind(this);
    this.gotoStep = this.gotoStep.bind(this);
  }
  componentDidMount () {
    var thisComponent = this;
    if (this.props.slides) {
      this.state.stackIds.push('CENTER');
      this.state.current = 0;
      for (var i = 1; i < this.props.slides.length-1; i++) {
        this.state.stackIds.push('RIGHT');
      }
      this.state.stackIds.push('LEFT');
      this.state.timerId = window.setTimeout(thisComponent.setNext,this.props.interval||5000);
      this.setState(this.state);
    }
  }
  componentWillReceiveProps (newProps) {
    if (this.props.slides.length != newProps.slides.length) {
      var thisComponent = this;
      if (newProps.slides) {
        this.state.stackIds = [];
        this.state.stackIds.push('CENTER');
        this.state.current = 0;
        for (var i = 1; i < newProps.slides.length-1; i++) {
          this.state.stackIds.push('RIGHT');
        }
        this.state.stackIds.push('LEFT');
        if (this.state.timerId != -1) {
          window.clearTimeout(this.state.timerId);
        }
        this.state.timerId = window.setTimeout(thisComponent.setNext,newProps.interval||5000);
        this.setState(this.state);
      }
    }
  }
  componentWillUnmount () {
    if (this.state.timerId != -1) {
      window.clearTimeout(this.state.timerId);
    }
  }
  pause () {
    window.clearTimeout(this.state.timerId);
    this.setState({timerId : -1});
  }
  unpause () {
    this.state.timerId = window.setTimeout(this.setNext,this.props.interval||5000);
    this.setState(this.state);
  }
  setNext (method) {
    if (this.state.current === this.state.stackIds.length-1) {
      this.state.current = 0;
    }else{
      this.state.current ++;
    }
    this.state.stackIds[this.state.current] = 'CENTER';
    if (this.state.current === this.state.stackIds.length-1) {
      this.state.stackIds[0] = 'RIGHT'
    }else{
      this.state.stackIds[this.state.current+1] = 'RIGHT';
    }
    if (this.state.current === 0) {
      this.state.stackIds[this.state.stackIds.length-1] = 'LEFT';
    }else{
      this.state.stackIds[this.state.current-1] = 'LEFT';
    }
    if (!method) {
      this.state.timerId = window.setTimeout(this.setNext, this.props.interval||5000);
    }
    this.setState(this.state);
  }
  setPrev () {
    if (this.state.current === 0) {
      this.state.current = this.state.stackIds.length-1;
    }else{
      this.state.current --;
    }
    this.state.stackIds[this.state.current] = 'CENTER';
    if (this.state.current === this.state.stackIds.length-1) {
      this.state.stackIds[0] = 'RIGHT'
    }else{
      this.state.stackIds[this.state.current+1] = 'RIGHT';
    }
    if (this.state.current === 0) {
      this.state.stackIds[this.state.stackIds.length-1] = 'LEFT';
    }else{
      this.state.stackIds[this.state.current-1] = 'LEFT';
    }
    this.setState(this.state);
  }
  handleHeightChange (height) {
    if (height > this.state.minHeight) {
      var isMobile = !window.matchMedia('(min-width : 500px)').matches;
      var padding = isMobile?129:37;
      this.state.minHeight = height+padding;
      this.setState(this.state);
    };
  }
  gotoStep (stepIndex) {
    var stepCount = stepIndex - this.state.current;
    var shiftTime = 50;
    if (stepCount > 0) {
      for (var i=0;i<stepCount;i++) {
        window.setTimeout(this.setNext.bind(this,'fwd'),shiftTime*i);
      }
    }else if (stepCount < 0) {
      stepCount = Math.abs(stepCount);
      for (var i=0;i < stepCount;i++) {
        window.setTimeout(this.setPrev,shiftTime*i);
      }
    }
  }
  render () {
    var thisComponent = this;
    var styles = {
      stage : {
        'minWidth' : '100%',
        'position' : 'relative',
        'display' : 'inline-block',
        'overflow' : 'hidden',
        'minHeight' : this.state.minHeight+'px'
      },
      clearfix : {
        'visibility' : 'hidden',
        'fontSize' : '0',
        'display' : 'block',
        'clear' : 'both',
        'height' : '0'
      },
      dotContainer : {
        'textAlign' : 'center',
        'position' : 'absolute',
        'bottom' : '0px',
        'width' : '100%'
      }
    };
    return (<div
      onMouseEnter={this.pause}
      onMouseLeave={this.unpause}
      style={styles.stage}>
      {this.props.slides.map(function (slide,n){
        return (<CarouselItem key={n}
          onHeightChange={thisComponent.handleHeightChange}
          stack={thisComponent.state.stackIds[n]}>
          {slide}
        </CarouselItem>);
      })}
      <div
        style={styles.dotContainer}>
        {this.props.slides.map(function (slide,n){
          return (<Indicator key={n}
            stack={thisComponent.state.stackIds[n]}
            onClick={thisComponent.gotoStep.bind(thisComponent,n)} />);
        })}
      </div>
    </div>);
  }
};

module.exports = Carousel;

