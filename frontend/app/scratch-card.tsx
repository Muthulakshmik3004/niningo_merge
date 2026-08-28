import React, { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Dimensions,
    StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================
// SETTINGS
// ============================================================

const CARD_SIZE = SCREEN_WIDTH - 46;

// Number of cells in the scratch surface
const GRID_SIZE = 16;

// How many cells need to be scratched
const REQUIRED_PERCENTAGE = 45;


// ============================================================
// MAIN SCREEN
// ============================================================

export default function ScratchCardScreen() {

    // ----------------------------------------------------------
    // Scratched cells
    // ----------------------------------------------------------

    const [scratchedCells, setScratchedCells] = useState<
        Set<number>
    >(new Set());

    // ----------------------------------------------------------
    // Prevent navigation multiple times
    // ----------------------------------------------------------

    const completedRef = useRef(false);


    // ==========================================================
    // CALCULATE SCRATCHED PERCENTAGE
    // ==========================================================

    const scratchedPercentage =
        (scratchedCells.size /
            (GRID_SIZE * GRID_SIZE)) *
        100;


    // ==========================================================
    // SCRATCH CELL
    // ==========================================================

    const scratchAtPosition = (
        x: number,
        y: number
    ) => {

        // Keep touch inside card

        if (
            x < 0 ||
            y < 0 ||
            x > CARD_SIZE ||
            y > CARD_SIZE
        ) {
            return;
        }


        // Convert touch position to grid position

        const cellWidth =
            CARD_SIZE / GRID_SIZE;

        const column = Math.floor(
            x / cellWidth
        );

        const row = Math.floor(
            y / cellWidth
        );


        // Make scratching slightly wider
        // so the user doesn't need to touch
        // every single cell.

        const cellsToScratch: number[] = [];

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {

            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset++
            ) {

                const newRow =
                    row + rowOffset;

                const newColumn =
                    column + columnOffset;


                if (
                    newRow >= 0 &&
                    newRow < GRID_SIZE &&
                    newColumn >= 0 &&
                    newColumn < GRID_SIZE
                ) {

                    const index =
                        newRow * GRID_SIZE +
                        newColumn;

                    cellsToScratch.push(index);
                }
            }
        }


        // Update scratched cells

        setScratchedCells((previous) => {

            const next = new Set(previous);

            cellsToScratch.forEach((cell) => {
                next.add(cell);
            });

            return next;
        });
    };


    // ==========================================================
    // CHECK COMPLETION
    // ==========================================================

    const checkCompletion = (
        nextSet: Set<number>
    ) => {

        const percentage =
            (nextSet.size /
                (GRID_SIZE * GRID_SIZE)) *
            100;


        if (
            percentage >=
            REQUIRED_PERCENTAGE &&
            !completedRef.current
        ) {

            completedRef.current = true;

            // Small delay so the user can see
            // the final scratch action.

            setTimeout(() => {

                router.replace(
                    "/scratch-success"
                );

            }, 250);
        }
    };


    // ==========================================================
    // PAN RESPONDER
    // ==========================================================

    const panResponder =
        useRef(

            PanResponder.create({

                // Start receiving touch

                onStartShouldSetPanResponder: () =>
                    true,

                // Continue receiving touch

                onMoveShouldSetPanResponder: () =>
                    true,


                // Finger touches card

                onPanResponderGrant: (
                    event
                ) => {

                    const {
                        locationX,
                        locationY,
                    } = event.nativeEvent;


                    scratchAtPosition(
                        locationX,
                        locationY
                    );
                },


                // Finger moves across card

                onPanResponderMove: (
                    event
                ) => {

                    const {
                        locationX,
                        locationY,
                    } = event.nativeEvent;


                    scratchAtPosition(
                        locationX,
                        locationY
                    );
                },


                // Finger released

                onPanResponderRelease: () => {

                    // Completion is checked
                    // by the state updater below.
                },

            })

        ).current;


    // ==========================================================
    // UPDATE COMPLETION AFTER STATE CHANGE
    // ==========================================================

    React.useEffect(() => {

        checkCompletion(
            scratchedCells
        );

    }, [scratchedCells]);


    // ==========================================================
    // RESET
    // ==========================================================

    const resetScratch = () => {

        completedRef.current = false;

        setScratchedCells(
            new Set()
        );
    };


    // ==========================================================
    // UI
    // ==========================================================

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />


            <View style={styles.container}>


                {/* ==================================================
            HEADER
        ================================================== */}

                <View style={styles.header}>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >

                        <Ionicons
                            name="arrow-back"
                            size={30}
                            color="#222222"
                        />

                    </TouchableOpacity>


                    <Text style={styles.headerTitle}>
                        Scratch Card
                    </Text>

                </View>


                {/* ==================================================
            SCRATCH CARD AREA
        ================================================== */}

                <View style={styles.cardArea}>

                    <View
                        style={[
                            styles.scratchCard,
                            {
                                width: CARD_SIZE,
                                height: CARD_SIZE,
                            },
                        ]}
                    >

                        {/* ------------------------------------------------
                COUPON ARTWORK
            ------------------------------------------------ */}

                        <ScratchCardArtwork
                            size={CARD_SIZE}
                        />


                        {/* ------------------------------------------------
                SCRATCH COVER
            ------------------------------------------------ */}

                        <View
                            style={[
                                styles.scratchSurface,
                                {
                                    width: CARD_SIZE,
                                    height: CARD_SIZE,
                                },
                            ]}
                            {...panResponder.panHandlers}
                        >

                            {/* Scratch cells */}

                            {Array.from({
                                length:
                                    GRID_SIZE *
                                    GRID_SIZE,
                            }).map((_, index) => {

                                const row =
                                    Math.floor(
                                        index / GRID_SIZE
                                    );

                                const column =
                                    index % GRID_SIZE;


                                const cellSize =
                                    CARD_SIZE /
                                    GRID_SIZE;


                                const isScratched =
                                    scratchedCells.has(
                                        index
                                    );


                                return (
                                    <View
                                        key={index}
                                        pointerEvents="none"
                                        style={[
                                            styles.scratchCell,
                                            {
                                                width: cellSize,
                                                height: cellSize,

                                                left:
                                                    column *
                                                    cellSize,

                                                top:
                                                    row *
                                                    cellSize,

                                                opacity:
                                                    isScratched
                                                        ? 0
                                                        : 1,
                                            },
                                        ]}
                                    />
                                );
                            })}


                            {/* Scratch instruction */}

                            {scratchedCells.size === 0 && (

                                <View
                                    pointerEvents="none"
                                    style={styles.instructionContainer}
                                >

                                    <Ionicons
                                        name="hand-left-outline"
                                        size={30}
                                        color="#FFFFFF"
                                    />

                                    <Text
                                        style={
                                            styles.instructionText
                                        }
                                    >
                                        Scratch the card
                                    </Text>

                                </View>

                            )}

                        </View>

                    </View>


                    {/* ==================================================
              PROGRESS
          ================================================== */}

                    <Text style={styles.progressText}>

                        {Math.min(
                            100,
                            Math.round(
                                scratchedPercentage
                            )
                        )}
                        % scratched

                    </Text>


                    <Text style={styles.helpText}>
                        Scratch the card to reveal your reward
                    </Text>


                    {/* ==================================================
              RESET BUTTON
          ================================================== */}

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetScratch}
                        activeOpacity={0.8}
                    >

                        <Ionicons
                            name="refresh"
                            size={19}
                            color="#B735A8"
                        />

                        <Text style={styles.resetText}>
                            Reset
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

        </SafeAreaView>
    );
}


// ============================================================
// SCRATCH CARD ARTWORK
// ============================================================

function ScratchCardArtwork({
    size,
}: {
    size: number;
}) {

    const center =
        size / 2;


    // ----------------------------------------------------------
    // Generate decorative squares
    // ----------------------------------------------------------

    const squares: React.ReactNode[] =
        [];


    const rings = [

        {
            radius: size * 0.16,
            count: 12,
            squareSize: 4,
        },

        {
            radius: size * 0.25,
            count: 18,
            squareSize: 4,
        },

        {
            radius: size * 0.34,
            count: 22,
            squareSize: 5,
        },

        {
            radius: size * 0.43,
            count: 28,
            squareSize: 5,
        },

        {
            radius: size * 0.51,
            count: 32,
            squareSize: 6,
        },

    ];


    rings.forEach(
        (ring, ringIndex) => {

            for (
                let i = 0;
                i < ring.count;
                i++
            ) {

                const angle =
                    (i / ring.count) *
                    Math.PI *
                    2 +
                    ringIndex * 0.2;


                const x =
                    center +
                    Math.cos(angle) *
                    ring.radius;


                const y =
                    center +
                    Math.sin(angle) *
                    ring.radius;


                squares.push(

                    <View
                        key={`${ringIndex}-${i}`}
                        style={{
                            position: "absolute",

                            width:
                                ring.squareSize,

                            height:
                                ring.squareSize,

                            left:
                                x -
                                ring.squareSize / 2,

                            top:
                                y -
                                ring.squareSize / 2,

                            backgroundColor:
                                "#C93773",

                            opacity:
                                0.35 +
                                ringIndex * 0.05,

                            transform: [
                                {
                                    rotate: `${(
                                        i * 17
                                    ) % 45}deg`,
                                },
                            ],
                        }}
                    />

                );
            }
        }
    );


    return (

        <View
            style={[
                styles.artwork,
                {
                    width: size,
                    height: size,
                },
            ]}
        >

            {/* ==================================================
          BACKGROUND
      ================================================== */}

            <View
                style={[
                    styles.artworkBackground,
                    {
                        width: size,
                        height: size,
                    },
                ]}
            />


            {/* ==================================================
          SOFT HALFTONE CIRCLE
      ================================================== */}

            <View
                style={[
                    styles.halftoneCircle,
                    {
                        width: size * 0.82,
                        height: size * 0.82,
                        borderRadius:
                            size * 0.41,

                        left:
                            size * 0.09,

                        top:
                            size * 0.09,
                    },
                ]}
            />


            {/* ==================================================
          SQUARE PATTERN
      ================================================== */}

            <View
                pointerEvents="none"
                style={[
                    styles.pattern,
                    {
                        width: size,
                        height: size,
                    },
                ]}
            >

                {squares}

            </View>


            {/* ==================================================
          RANDOM SMALL SQUARES
      ================================================== */}

            <View
                pointerEvents="none"
                style={[
                    styles.randomSquare,
                    {
                        left: size * 0.10,
                        top: size * 0.15,
                    },
                ]}
            />

            <View
                pointerEvents="none"
                style={[
                    styles.randomSquare,
                    {
                        left: size * 0.82,
                        top: size * 0.19,
                    },
                ]}
            />

            <View
                pointerEvents="none"
                style={[
                    styles.randomSquare,
                    {
                        left: size * 0.16,
                        top: size * 0.67,
                    },
                ]}
            />

            <View
                pointerEvents="none"
                style={[
                    styles.randomSquare,
                    {
                        left: size * 0.78,
                        top: size * 0.72,
                    },
                ]}
            />


            {/* ==================================================
          GIFT
      ================================================== */}

            <View
                style={[
                    styles.artworkGift,
                    {
                        width: size * 0.50,
                        height: size * 0.50,

                        left: size * 0.25,
                        top: size * 0.25,
                    },
                ]}
            >

                <Ionicons
                    name="gift"
                    size={size * 0.40}
                    color="#D32B70"
                />

            </View>

        </View>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#FFF4F8",
    },

    container: {
        flex: 1,
        backgroundColor: "#FFF4F8",
    },


    // ==========================================================
    // HEADER
    // ==========================================================

    header: {
        height: 72,

        backgroundColor: "#FFFFFF",

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 20,

        borderBottomWidth: 1,

        borderBottomColor: "#F0F0F0",
    },

    backButton: {
        width: 45,
        height: 45,

        alignItems: "center",
        justifyContent: "center",

        marginRight: 3,
    },

    headerTitle: {
        fontSize: 25,

        fontWeight: "700",

        color: "#B43DC0",
    },


    // ==========================================================
    // CARD AREA
    // ==========================================================

    cardArea: {
        flex: 1,

        alignItems: "center",

        paddingTop: 35,
    },

    scratchCard: {
        borderRadius: 12,

        overflow: "hidden",

        position: "relative",

        backgroundColor: "#E38AB0",

        elevation: 3,

        shadowColor: "#000000",

        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.12,

        shadowRadius: 5,
    },


    // ==========================================================
    // ARTWORK
    // ==========================================================

    artwork: {
        position: "absolute",

        left: 0,

        top: 0,

        overflow: "hidden",
    },

    artworkBackground: {
        position: "absolute",

        backgroundColor: "#E28AB0",
    },

    halftoneCircle: {
        position: "absolute",

        backgroundColor: "#EDA2C2",

        opacity: 0.55,
    },

    pattern: {
        position: "absolute",

        left: 0,

        top: 0,
    },

    randomSquare: {
        position: "absolute",

        width: 7,

        height: 7,

        backgroundColor: "#C83774",

        opacity: 0.55,
    },

    artworkGift: {
        position: "absolute",

        alignItems: "center",

        justifyContent: "center",

        zIndex: 5,
    },


    // ==========================================================
    // SCRATCH SURFACE
    // ==========================================================

    scratchSurface: {
        position: "absolute",

        left: 0,

        top: 0,

        overflow: "hidden",
    },

    scratchCell: {
        position: "absolute",

        backgroundColor: "#B93870",
    },


    // ==========================================================
    // INSTRUCTION
    // ==========================================================

    instructionContainer: {
        position: "absolute",

        left: 0,
        right: 0,

        top: 0,
        bottom: 0,

        alignItems: "center",

        justifyContent: "center",
    },

    instructionText: {
        marginTop: 8,

        fontSize: 17,

        fontWeight: "600",

        color: "#FFFFFF",
    },


    // ==========================================================
    // PROGRESS
    // ==========================================================

    progressText: {
        marginTop: 25,

        fontSize: 18,

        fontWeight: "700",

        color: "#B735A8",
    },

    helpText: {
        marginTop: 8,

        fontSize: 15,

        color: "#777777",

        textAlign: "center",
    },


    // ==========================================================
    // RESET
    // ==========================================================

    resetButton: {
        marginTop: 25,

        height: 42,

        paddingHorizontal: 20,

        borderRadius: 21,

        borderWidth: 1,

        borderColor: "#B735A8",

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",
    },

    resetText: {
        marginLeft: 7,

        fontSize: 15,

        fontWeight: "600",

        color: "#B735A8",
    },
});