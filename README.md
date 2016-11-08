# react-native-animated-steps
A component that helps you render "cards" step by step with animations.

![](http://g.recordit.co/bgxfWVQlCg.gif)

## Usage

```bash
npm install react-native-animated-steps
```

```javascript
import AnimatedSteps from 'react-native-animated-steps';

get cards () {
    return [
        (
        <View>
            <Text>This is the first step.</Text>
        </View>
        ),
        (
        <View>
            <Text>And this is the second.</Text>
        </View>
        ),
        (
        <View>
            <Text>Success ! This is the last step.</Text>
        </View>
        ),
    ];
}

render () {
    return (
        <AnimatedSteps
        ref={'cardnavigation'}
        cards={this.cards}
        />
    );
}
```

## Props

Prop | Description | Type | Default
------ | ------ | ------ | ------
cards | Array of React Elements | `array` | Required
containerStyle | Style of the view wrapping cards | `object` | Check styles in `index.js`
firstCard | First card to display | `number` | `0`
getNextCard | Override default behaviour [see below](#overriding-default-behaviour) | `function` | `undefined`
getPrevCard | Override default behaviour [see below](#overriding-default-behaviour) | `function` | `undefined`
prevButton | React element to render [see below](#rendering-custom-navigation-buttons) | `object` | Default plain button
nextButton | React element to render [see below](#rendering-custom-navigation-buttons) | `object` | Default plain button
onTransitionStart | Called when transition starts | `function` | `undefined`
onTransitionEnd | Called when transition ends | `function` | `undefined`
onChangeCard | Called when navigating to a new card with the card index as 1st param | `function` | `undefined`

## Rendering custom navigation buttons

Altough `prevButton` and `nextButton` are not required in any way, you will probably want to render your own elements.
You can do that by passing a function returning a React element that will receive the following parameters :

Parameter | Description | Type
------ | ------ | ------
`getCardPos(index)` | Returns the Y position of the card at the supplied `index`  | `function`
`currentCard` | Index of the current displayed card | `number`
`prevCard` | Index of the previous card **(in prevButton only)** | `number`
`showPrev() or showNext()` | Call this function to navigate | `function`

By default, `prevButton` won't be rendered on the first `index`, and `nextButton` won't be on the last. These functions are a great way of displaying them conditionally. For instance :

```javascript
    nextButton (getCardPos, currentCard, showNext) {
        const nextCard = currentCard + 1;

        if (nextCard === 3 && this.state.geolocationStatus !== 2) {
            // Don't render the nextButton until the user has been located
            return false;
        }

        return (
            ...
        );
    }
```

## Overriding default behaviour

By default, the `showPrev` and `showNext` functions supplied to your custom buttons will navigate to the `index - 1` and `index + 1` cards.
However, you might need to override this behaviour if you want to skip a step for instance.

In order to do that, you have to supply `getPrevCard` and/or `getNextCard` in your props. These functions need to return the index of the previous or the next card you want to navigate to.
They both receive `getCardPos()` and `currentCard` as their parameters, (see above for their description).

You should be able to implement any kind of customed logic with these. Here's an example :

```javascript
    getNextCard (getCardPos, currentCard) {
        const { town } = this.state;
        const nextCard = currentCard + 1;

        // Handle special cases
        if (nextCard === 1) {
            if (!town.hoods) {
                // Skip the hoodpicker (step 2) if the selected town
                // doesn't have any hood anyway
                return 2;
            } else {
                // We need to display the second step
                return 1;
            }
        }

        // In other cases, just display the `currentCard + 1` index
        return nextCard;
    }
```

## TODO

- [ ] Customize transitions
- [ ] Implement `shouldComponentRender` to improve perfs
- [ ] Thoroughly test the component