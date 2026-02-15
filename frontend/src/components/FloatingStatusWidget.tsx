import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { AppColors } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

interface FloatingStatusWidgetProps {
    patientName: string;
    status: string;
    issueSummary?: string;
    isVisible: boolean;
    onDismiss?: () => void;
    onPress?: () => void;
}

export const FloatingStatusWidget: React.FC<FloatingStatusWidgetProps> = ({
    patientName,
    status,
    issueSummary,
    isVisible,
    onDismiss,
    onPress,
}) => {
    const pan = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (isVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, fadeAnim]);

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                pan.extractOffset();
            },
        })
    ).current;

    if (!isVisible) return null;

    const getStatusColor = () => {
        switch (status.toLowerCase()) {
            case 'critical':
            case 'urgent':
                return AppColors.error;
            case 'warning':
            case 'attention':
                return AppColors.warning;
            case 'stable':
                return AppColors.success;
            default:
                return AppColors.info;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                    ],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                style={styles.widget}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
                <View style={styles.content}>
                    <Text style={styles.patientName} numberOfLines={1}>
                        {patientName}
                    </Text>
                    <Text style={[styles.status, { color: getStatusColor() }]}>
                        {status}
                    </Text>
                    {issueSummary && (
                        <Text style={styles.issueSummary} numberOfLines={2}>
                            {issueSummary}
                        </Text>
                    )}
                </View>
                {onDismiss && (
                    <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={onDismiss}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.dismissText}>×</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 999,
        elevation: 10,
    },
    widget: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    status: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
        marginBottom: 2,
    },
    issueSummary: {
        fontSize: 12,
        color: '#666',
    },
    dismissButton: {
        padding: 4,
        marginLeft: 8,
    },
    dismissText: {
        fontSize: 20,
        color: '#999',
        fontWeight: '300',
    },
});

export default FloatingStatusWidget;
