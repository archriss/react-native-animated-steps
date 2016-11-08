import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Dimensions,
    InteractionManager,
    BackAndroid
} from 'react-native';

export default class CardNavigation extends Component {

    // TODO : Provide a custom animation prop.
    // It would need two Animated.x() that would be started in this.animate()
    // so the callback props (onTransitionStart...) could be fired easily.
    // The hard thing would be to provide another prop to set the default
    // Animated.Value in each cardPos in the constructor and to pass these values
    // in the renderCards loop.

    static propTypes () {
        return {
            cards: PropTypes.array.isRequired,
            containerStyle: PropTypes.object.isRequired,
            firstCard: PropTypes.number,
            getNextCard: PropTypes.func,
            getPrevCard: PropTypes.func,
            prevButton: PropTypes.element,
            nextButton: PropTypes.element,
            onTransitionStart: PropTypes.func,
            onTransitionEnd: PropTypes.func,
            onChangeCard: PropTypes.func
        };
    };

    constructor (props) {
        super(props);
        this.state = {
            prevCard: false,
            currentCard: props.firstCard || 0,
            cardsPos: []
        };
        this.deviceHeight = Dimensions.get('window').height;
        this.firstCard = props.firstCard || 0;
        this.getCardPos = this.getCardPos.bind(this);
        this.showCard = this.showCard.bind(this);
        this.showNext = this.showNext.bind(this);
        this.showPrev = this.showPrev.bind(this);
        this.androidBack = this.androidBack.bind(this);
        // Init the array of animatable positions
        for (let i = 0; i < props.cards.length; i++) {
            this.state.cardsPos.push(new Animated.Value(i === this.firstCard ? 0 : -this.deviceHeight));
        }
        // Android
        BackAndroid.addEventListener('hardwareBackPress', this.androidBack);
    }

    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.androidBack);
    }

    shouldComponentUpdate (nextProps, nextState) {
        // return this.state.currentCard !== nextState.currentCard;
        return true;
    }

    androidBack () {
        // Using the render method here to know
        // easily if going back is possible
        if (this.prevButton) {
            this.showPrev();
            return true;
        }
    }

    setCurrentCard (index) {
        this.setState({ currentCard: index });
    }

    setPrevCard (index) {
        this.setState({ prevCard: index });
    }

    getCardPos (index) {
        return this.state.cardsPos[index] || false;
    }

    animate (currentCard, nextCard) {
        const { onTransitionStart, onTransitionEnd, onChangeCard } = this.props;
        const currentVal = this.getCardPos(currentCard);
        const nextVal = this.getCardPos(nextCard);

        if (onTransitionStart) {
            onTransitionStart();
        }

        Animated.timing(
            currentVal,
            { toValue: -this.deviceHeight }
        ).start();

        Animated.timing(
            nextVal,
            { toValue: 0 }
        ).start(() => {
            if (onTransitionEnd) {
                onTransitionEnd();
            }
            if (onChangeCard) {
                onChangeCard(nextCard);
            }
            this.setPrevCard(currentCard);
            this.setCurrentCard(nextCard);
        });
    }

    showCard (index) {
        InteractionManager.runAfterInteractions(() => {
            const nextVal = this.getCardPos(index);
            const { currentCard } = this.state;

            if (!nextVal) {
                console.warn(`Trying to show unknown card ${index}`);
                return;
            }
            this.animate(currentCard, index);
        });
    }

    showNext () {
        const { getNextCard } = this.props;
        const { currentCard } = this.state;
        const nextIndex = getNextCard ?
            getNextCard(this.getCardPos, currentCard) :
            this.state.currentCard + 1;

        this.showCard(nextIndex);
    }

    showPrev () {
        const { getPrevCard } = this.props;
        const { prevCard, currentCard } = this.state;
        const prevIndex = getPrevCard ?
            getPrevCard(this.getCardPos, currentCard, prevCard) :
            prevCard < currentCard ? prevCard : currentCard - 1;

        return this.showCard(prevIndex);
    }

    get prevButton () {
        const { prevButton } = this.props;
        const { prevCard, currentCard } = this.state;
        const prevVal = this.getCardPos(prevCard);

        if (currentCard === 0 || !prevVal) {
            return false;
        }

        // Provided button
        if (prevButton) {
            return prevButton(this.getCardPos, currentCard, prevCard, this.showPrev);
        }

        // Default button
        return (
            <TouchableOpacity style={styles.prevButtonContainer} onPress={this.showPrev}>
                <Text>Préc.</Text>
            </TouchableOpacity>
        );
    }

    get nextButton () {
        const { nextButton } = this.props;
        const { currentCard } = this.state;

        const nextCard = currentCard + 1;
        const nextVal = this.getCardPos(nextCard);

        if (!nextVal) {
            return false;
        }

        // Provided button
        if (nextButton) {
            return nextButton(this.getCardPos, currentCard, this.showNext);
        }

        // Default button
        return (
            <TouchableOpacity style={styles.nextButtonContainer} onPress={this.showNext}>
                <Text>Suiv.</Text>
            </TouchableOpacity>
        );
    }

    get buttons () {
        const prevButton = this.prevButton;
        const nextButton = this.nextButton;

        if (!prevButton && !nextButton) {
            return false;
        }

        let justifyContent = 'space-between';

        if (prevButton && !nextButton) {
            justifyContent = 'flex-start';
        } else if (!prevButton && nextButton) {
            justifyContent = 'flex-end';
        }

        return (
            <View style={[styles.buttonsContainer, {justifyContent: justifyContent}]}>
                { prevButton }
                { nextButton }
            </View>
        );
    }

    get renderCards () {
        return this.props.cards.map((card, index) => {
            return (
                <Animated.View style={[{ top: this.getCardPos(index) }, styles.stepContainer]} key={`card-${index}`}>
                    { card }
                </Animated.View>
            );
        });
    }

    render () {
        const { containerStyle } = this.props;

        return (
            <View style={containerStyle || styles.container}>
                { this.renderCards }
                { this.buttons }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height,
        backgroundColor: 'grey'
    },
    stepContainer: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    prevButtonContainer: {
        width: 100,
        height: 30,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    nextButtonContainer: {
        width: 100,
        height: 30,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
