import WebGL from 'three/addons/capabilities/WebGL.js'

import { Pages } from './pages'
import { Scroll } from './scroll'
import { Resize } from './utils/subscribable'
import { Raf } from './utils/subscribable'
import { Dom } from './dom'

import Hey from './utils/hey'
import Gl from './gl/Gl'
import ScrollController from './modules/ScrollController'
import Loader from './modules/loader'

/** you might want to activate it only towards the end of the project? */
history.scrollRestoration = 'manual'

export class App {
  /* 
    Root
  */
  static {
    if (WebGL.isWebGL2Available()) {
      this.initWebGLVersion()
    } else {
      this.initFallback()
    }
  }

  /* 
    Functions
  */
  static async initWebGLVersion() {
    this.urlParams = new URLSearchParams(window.location.search)
    this.isDebug = this.urlParams.has('debug')

    /* 
      Promises Init
    */
    this.promises = []

    /* 
    [ - - - - - - - - - - - - ]
    Init classes
    [ - - - - - - - - - - - - ]
    */

    this.setLoadedClasses()

    // Initialize loader
    this.loader = new Loader(Hey.PAGE_SLUG)

    // Start loader animations
    this.loaderPromise = this.loader.loaderAnimation(Hey.PAGE_SLUG)

    // GL
    this.gl = new Gl({
      canvas: '[data-gl-canvas]',
    })
    this.promises.push(this.gl.load())

    /* 
    [▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░]
    Await WebGL loading
    [▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░]
    */
    await Promise.all(this.promises)

    /* 
    [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%]
    WebGL is loaded, now trigger loader outro and wait for it to complete
    [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%]
    */
    // Now that WebGL is ready, trigger the loader outro and wait for it to complete
    await this.loader.animationOutro(Hey.PAGE_SLUG)

    // Outro is complete, init gl
    ScrollController.init()

    switch (Hey.PAGE_SLUG) {
      case '/':
        this.gl.init('homepage')
        break
      case '/preorder':
        this.gl.init('easter-egg')
        break
      case '/specs':
        this.gl.init('specs')
        break
      case '/fwa':
        this.gl.init('fwa')
        break
    }

    // Everything is ready
    document.documentElement.classList.add('is-ready')
  }

  // need it to be outside loader for pages without HP loader
  static setLoadedClasses() {
    // Remove duplicate WF Designer styles on live builds
    document.getElementById('designerStyles')?.remove()

    document.documentElement.classList.add('is-loaded')

    setTimeout(() => {
      Scroll.toTop()
      // document.documentElement.classList.add('is-ready')
    }, 200)
  }

  static initFallback() {
    this.setLoadedClasses()

    /* 
      Fallback
    */
    console.log('[WebGL] [   (╯︵╰,)   ] -', 'WebGL 2.0 is not available - initializing fallback.')

    document.documentElement.classList.add('webgl-not-available')
  }
}

setTimeout(() => {
  // ------------------------------ welcome message

  const baseStyle = 'background-color: #FDFDF5; color: black; font: 400 1em monospace; padding: 0.5em 0;'
  const boldStyle = 'background-color: #FDFDF5; color: black; font: 400 1em monospace; padding: 0.5em 0; font-weight: bold;'

  // Log the styled message to the console
  console.log('%c built by OFF+BRAND. %c > https://itsoffbrand.com', boldStyle, '')
}, 500)
