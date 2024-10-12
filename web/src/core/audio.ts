import {Howl} from 'howler'

const chips = [] as Howl[]
const slides = [] as Howl[]

export function play(name: 'chip' | 'slide') {
  switch (name) {
    case 'chip': {
      let h = chips.pop()
      if (h) return h.play()
      h = new Howl({src: '/game/audio/chip.ogg', autoplay: true})
      h.on('end', () => chips.push(h))
      break
    }

    case 'slide': {
      let h = slides.pop()
      if (h) return h.play()
      h = new Howl({src: '/game/audio/card-slide.ogg', autoplay: true})
      h.on('end', () => slides.push(h))
    }
  }

}
