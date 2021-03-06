import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'

import swiperStyles from 'swiper/dist/css/swiper.css'

import { constantSelector } from 'src/store'
import { IterationModel } from 'src/models'
import { Swiper } from 'src/plugins'

import styles from './RoadmapSection.sass'

@connect(mapStateToProps)
export default class RoadmapSection extends React.Component {

  static propTypes = {
    iterations: PropTypes.arrayOf(IterationModel),
    constants: PropTypes.func,
    userLanguage: PropTypes.string,
  }

  componentDidMount () {
    this.currentProgress = null
    this.swiper = new Swiper(this.swiperElement, {
      setWrapperSize: true,
      slidesPerView: 'auto',
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      centeredSlides: true,
      paginationBulletRender: function (swiper, index, className) {
        return `<div class="${className}"><p class="roadmap__data-value">${index + 1} '2017'></p></div>`
      },
      keyboardControl: true,
      // spaceBetween: 40,
      grabCursor: true,
      onInit: (swiper) => {
        swiper.slideTo(8, 1)
        this.swiperElement.style.opacity = 1
      },
      // eslint-disable-next-line
      onProgress: (swiper, progress) => {
        if (this.swiperPaginationFillElement) {
          this.swiperPaginationFillElement.style.width = `${progress * swiper.slides.length * 274}px`
        }
      },
    })
  }

  renderItem (iteration, index) {
    return (
      <div className='item'>
        <style jsx>{styles}</style>
        <div className='logo'>
          {!iteration.image ? null : (
            <div className='image' key={iteration.id}>
              <img
                alt={iteration.title}
                {...{
                  src: iteration.image ? `${iteration.image.url}` : undefined,
                  srcSet: iteration.image2x ? `${iteration.image2x.url} 2x` : undefined,
                }}
              />
            </div>
          )}
        </div>
        <div className='text' dangerouslySetInnerHTML={{ __html: iteration.brief }} />
        <div className='bullet' onClick={() => this.swiper.slideTo(index)} />
        <div className='label'>
          <div>{moment(iteration.date).utc().format('MMM, YYYY')}</div>
        </div>
      </div>
    )
  }

  render () {
    const { iterations, constants } = this.props
    const items = [ ...iterations].sort((a,b) => {
      return moment.utc(a.date).diff(moment.utc(b.date))
    })
    const progress = (() => {
      if (items.length > 0) {
        const min = moment.utc(items[0].date).unix()
        const max = moment.utc(items[items.length - 1].date).unix()
        const current = moment().unix()
        return (current < max && current > min)
          ? (current - min) / (max - min)
          : null
      }
    })()

    return (
      <div className='root roadmap-section'>
        <style jsx>{styles}</style>
        <style jsx>{swiperStyles}</style>
        <div className='wrap'>
          <div className='content'>
            <div className='swiper-container' ref={(swiper) => { this.swiperElement = swiper }}>
              <div className='swiper-wrapper' ref={(swiperWrapper) => { this.swiperWrapperElement = swiperWrapper}}>
                <div className='line' ref={(swiperPaginationLine) => { this.swiperPaginationLineElement = swiperPaginationLine}}>
                  <div className='point' style={{ left: `${Math.round(progress * 100)}%` }}>
                    <div className='point-label'>
                      <img src='/static/images/symbols/geopoint.svg' />
                      <span>{constants('we-are-here')}</span>
                    </div>
                  </div>
                </div>
                <div className='fill' ref={(swiperPaginationFill) => { this.swiperPaginationFillElement = swiperPaginationFill}} />
                {items.map((iteration, index) => (
                  <div key={iteration.id} className='swiper-slide'>
                    {this.renderItem(iteration, index)}
                  </div>
                ))}
              </div>
              <div className='swiper-pagination-line-box'>
                <div className='swiper-pagination-line' ref={(swiperPaginationLine) => { this.swiperPaginationLineElement = swiperPaginationLine}} />
              </div>
              <div className='swiper-button-prev swiper-button'>
                <div className='icon-left' />
              </div>
              <div className='swiper-button-next swiper-button'>
                <div className='icon-right' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    iterations: state.pages.iterations.array,
    constants: constantSelector(state),
    userLanguage: state.pages.userLanguage,
  }
}
