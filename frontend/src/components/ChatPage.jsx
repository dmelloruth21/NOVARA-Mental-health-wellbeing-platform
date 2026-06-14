import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import AnimatedMascot from './AnimatedMascot';
import { detectThemeFromText } from '../themes';
import './ChatPage.css';

// ── Static Datasets ──────────────────────────────────────────

const bedtimeStories = [
  {
    id: 0,
    title: "The Deer Who Walked Into the Evening Mist",
    emoji: "🦌",
    text: `Close your eyes. Breathe out slowly. And imagine you are standing at the edge of a great forest, just as the last amber light of evening melts into the horizon.

The air here smells of damp earth and pine needles and something sweet you cannot quite name. A thin silver mist is beginning to rise from the ground, curling gently around the roots of old oak trees, threading silently between the ferns.

You are not walking. You are simply... present. Still. The forest does not ask anything of you.

And then — you see her.

A deer. A young doe, moving without sound through the dimming light. Her coat is the colour of autumn leaves, soft and warm. Her dark eyes catch the last glow of dusk, luminous and calm, as if she has never known a single worried thought in her life.

She does not see you. Or perhaps she does — and she has decided you are safe.

She lowers her head and drinks from a shallow, mirror-still pool at the base of a mossy boulder. The water barely ripples. Somewhere far above in the canopy, a wood pigeon calls once... twice... and then falls silent.

You breathe in. The forest breathes with you.

The mist continues to rise, quietly, unhurried, wrapping the deer in a soft white veil. More deer emerge from the treeline — three, four, five of them — drifting like ghosts into the clearing. They move so gently that the ferns barely tremble as they pass.

You notice your shoulders dropping. You notice the weight leaving your chest, dissolving into the cool evening air like the mist itself.

The oldest deer, a stag with great antlers like bare winter branches, walks to the centre of the clearing and stands perfectly still. He lifts his head and gazes up at the first stars appearing in the pale violet sky above the canopy. He stands there a long time. As if listening to something vast and slow — the breathing of the earth itself.

The forest grows darker now, very gently, like someone lowering a lamp shade over the world. The crickets begin their soft electric hum. A firefly blinks once in the undergrowth, then another, and another, until the shadows between the trees are scattered with tiny cold stars of light.

The deer begin to settle. One by one they fold their legs beneath them and lower themselves into the deep grass, their heads resting forward, their breathing slow and visible in the cooling air.

You feel your own body growing heavy. The ground beneath you feels soft. The mist curls around you like a blanket.

The last sound you hear is the far-off call of a night bird, liquid and low and endlessly soothing — floating across the treetops, fading, fading, fading into the deep and merciful quiet of the forest night.

Sleep now. The forest is keeping watch. Everything is safe. Everything is still.`
  },
  {
    id: 1,
    title: "The Elephant and the River of Stars",
    emoji: "🐘",
    text: `Let the tension leave your body. Let your hands grow heavy. Let the thoughts that have been circling all day begin to slow, like water finding a quiet pool.

Picture a wide African plain beneath a sky so full of stars it seems the heavens might crack open with light. The dry grass glows silver. The baobab trees stand like ancient sentinels, their arms raised toward the Milky Way, which stretches overhead in a slow river of white fire.

At the edge of a dark, still waterhole, a lone elephant stands.

She is old. Her skin is a map of a long, full life — creased and textured like the bark of the oldest tree. Her tusks catch the starlight. She breathes slowly, deeply, her great sides rising and falling like the slow tide of a dark sea.

She is in no hurry. She has not been in a hurry for many years.

She walks to the edge of the water and drinks — long, slow draws that make the surface ripple in perfect circles that spread and spread until they reach the far bank and vanish. She lifts her trunk and lets the water fall across her back in a soft, whispering curtain. Steam rises from the warmth of her body into the cool night air.

Around the watering hole, in the shadows: zebra, sleeping standing, their stripes dissolving into the dark. A family of impala, curled nose-to-tail in the grass. Two giraffes folded impossibly beneath the stars, their long necks curved like river reeds.

Everything rests. The plain rests. The dry wind rests.

The elephant turns and walks slowly back from the water's edge. She does not go far. She finds a spot beneath a wide acacia tree where the ground is soft, and she begins, with enormous patience, to lower herself — first her front knees, then the great weight of her body — until she is lying on her side in the moonlight.

Her eyes close slowly. She exhales — a long, warm, contented breath that moves the grass around her.

And the stars above turn in their ancient, slow wheel. The Southern Cross tilts gently in the south. The Milky Way pours its silver light across the sleeping plain.

You feel it too — that ancient heaviness that comes not from exhaustion but from completion. From the sense that the day has been lived, fully, and that now it is held. The earth holds it. The stars hold it.

You have nothing more to do. The night is enormous and gentle and it asks only one thing of you.

Let go. Rest. Like the great elephant under her acacia tree, under her river of stars.

Sleep now. Deeply and completely. You are held.`
  },
  {
    id: 2,
    title: "The Owl's Watch Over the Sleeping Valley",
    emoji: "🦉",
    text: `Let your breathing slow. There is no rush here. The night has all the time in the world, and so do you.

Imagine a high mountain ridge, just after midnight. Below you — far below — a valley stretches out in the darkness, a patchwork of silver fields and dark forest, threaded through with the faint glimmer of a river catching moonlight.

A barn owl sits on a fencepost at the ridge's edge.

She has been here all night. She is made for this — for the deep silence, for the velvet dark, for the particular quality of stillness that comes in the hours when even the wind forgets to blow.

Her feathers are white as new snow on one side, cream and gold and the softest brown on the other. Her face is a perfect heart, a pale disc that gathers sound the way a satellite dish gathers signal from distant stars. She hears everything. The rustle of a field mouse a hundred metres below. The slow drip of dew from a leaf. The breathing of the valley itself.

She watches, but without urgency. Her great dark eyes blink slowly, once, twice. The world below is safe tonight. The valley sleeps, and she is content to let it sleep.

In the farmhouse at the valley's floor, a light went out hours ago. In the village a mile east, the last dog has stopped barking. The roads are empty. Even the motorway on the far horizon has gone quiet.

The owl turns her head — three hundred degrees of silent rotation — and gazes back along the ridge. A fox trots across the field behind her, red fur made silver by the moon, stopping once to look up at her and then moving on. They have an understanding, the owl and the fox. The night belongs to both of them equally.

She spreads her wings — enormous, soundless — and lifts into the air. She does not beat her wings hard. She merely opens them and the air receives her, holds her, carries her in long, effortless arcs above the ridge.

Below, a stream catches the moonlight and becomes for a moment a ribbon of hammered silver. Trees sway in a breath of wind. A cloud moves slowly across the face of the moon and the valley dims, then brightens again, as if the whole world is breathing.

The owl calls once — that low, hushing sound that seems to say: hush, hush, hush. All is well. Sleep now. I am watching. Nothing will be lost in the dark. Nothing will be missed.

Let her watch carry you. Let the valley be your body — dark, resting, held by hills on every side.

The owl circles once more and lands again on her fencepost. She tucks her wings. She closes her eyes to narrow slits.

And the whole sleeping valley breathes, in and out, slowly, gently — like something enormous and alive that has been at peace for a thousand years.`
  },
  {
    id: 3,
    title: "The Whale Who Sang to the Deep",
    emoji: "🐋",
    text: `Feel the weight of your body. Feel how the surface beneath you holds you completely. You don't have to hold yourself up. You never did. You are held.

Now imagine you are underwater. But not cold, not dark — warm, and lit by a deep blue light that comes from everywhere and nowhere, the way light moves in the shallows of a clear tropical sea.

You are floating. Weightless. Suspended.

And somewhere far below you, a blue whale is singing.

You cannot see her yet. She is a hundred metres down, where the water turns from turquoise to the deepest, most ancient blue. But you can feel the sound of her. It travels up through the water not as noise but as vibration — slow, vast, rolling waves of sound that move through your entire body the way a warm tide moves through sand.

Her song has no words. It has no need of words. It is older than language. It is the sound of something enormous at complete and utter peace with itself.

Slowly, she rises.

First her shadow — an impossible shadow, the length of three buses, impossibly graceful — darkens the water below you. Then her shape resolves: the long tapered body, the great fluked tail moving in a slow, hypnotic sweep, up and down, up and down, in a rhythm your own breathing begins to follow without meaning to.

She is beside you now. Her eye — the size of a dinner plate, warm brown, fringed with fine white lashes — turns toward you. She sees you. She is not alarmed. She blinks, slowly, and turns her gaze back to the open water ahead of her.

You drift alongside her.

She sings as she swims. The sound fills the ocean around you and the ocean holds the sound the way a cathedral holds music — letting it bloom, letting it expand to fill every corner and cavity, until the silence between notes is as full and rich as the notes themselves.

Small fish part around her like silver rain. A sea turtle, ancient and unhurried, turns slowly in her wake. Jellyfish drift upward on invisible currents, trailing their long transparent threads like the most patient thoughts you have ever had.

You feel your mind slowing to match the pace of the deep. The thoughts that seemed so urgent on the surface — so sharp, so insistent — grow soft and shapeless here, dissolving like salt in warm water.

The whale dives again, gently, unhurriedly, her tail rising once above the surface like a great dark wing — and then she is gone, back into the deep blue, carrying her song with her. And even as she goes, the song remains. It has already entered the water, the rock, the ocean floor. It will travel for thousands of miles. It will be heard by other whales in other seas.

You float. The water holds you. The song holds you. The deep, dark, gentle ocean holds you.

Breathe out. Sink a little deeper into your bed. Into the quiet. Into the blue.

Sleep.`
  },
  {
    id: 4,
    title: "The Wolf Pack Beneath the Mountain Moon",
    emoji: "🐺",
    text: `Let your body sink. Let the surface hold you. Let the day fall away like water from a stone.

Picture a forest of tall silver birch trees on the side of a mountain, somewhere far north. It is winter, but it is not cold — not here, not in this story. Here the air is crisp and clean and smells of pine resin and fresh snow and something ancient, something that has no name in modern language.

The moon is full. So full that the snow between the trees glows with its own blue-white light, and the shadows of the birch trunks lie across the ground like the bars of light through a window at dawn.

The wolf pack is resting.

There are eight of them. They have eaten well and walked far and now they are gathered in a clearing, curled together in a great warm heap of silver and grey and white fur. Their breath rises in small clouds that drift upward into the cold clear air.

The alpha female lies at the centre. She is large and grey and entirely at ease — her paws stretched out before her, her head resting on the back of her mate. Her amber eyes are half-closed. She watches the moonlit clearing with the sleepy, satisfied attention of someone who knows that all is well.

A young wolf at the edge of the group twitches in its sleep, running somewhere in its dreams, its paws paddling softly against the snow. An older wolf lifts its great head, watches the youngster for a moment with patient, heavy eyes, then lowers its chin back to its paws and is still.

Above them, a billion stars wheel slowly in the black northern sky. The moon casts long, quiet shadows. Somewhere on the ridge above, a single pine tree sways in a breath of wind, sending a soft cascade of snow from its branches that catches the moonlight and falls in a slow silent glitter.

The forest is so quiet you can hear the snow settling. You can hear the soft exhalations of sleeping wolves. You can hear, if you are still enough, the very slow turning of the earth beneath it all.

You are standing at the edge of the clearing. The wolves know you are there. They have known since you arrived. They are not afraid — and neither are you. You are simply... together. Part of the same quiet night. Part of the same breathing world.

Your legs feel heavy. Your eyes feel heavy. The moonlight is very soft and very even, like a gentle hand resting on your forehead.

You sink down at the edge of the clearing, into the soft snow that is not cold, and you lean back against the smooth white bark of a birch tree, and the forest holds you.

The wolves breathe. The trees breathe. The mountain breathes beneath you all.

Close your eyes. You are safe here. You are warm here. The pack is all around you, and the moon is enormous and still and the stars are very far away and very beautiful and they have been burning for a billion years and they will burn for a billion more.

Sleep now. The forest will keep watch. The moon will keep watch. Rest completely. You have arrived.`
  },
  {
    id: 5,
    title: "Dawn Mist on the Heron Lake",
    emoji: "🪷",
    text: `Breathe out, slowly. Longer than you think you need to. And again. Let everything that is tight and held begin to loosen, the way ice at the edge of a lake loosens in the first warmth of morning.

Imagine a lake. Not large — intimate, enclosed by tall reeds on three sides and by a line of willow trees whose branches trail in the water on the fourth. The sky above is that particular shade of blue that exists only in the hour before full dawn — not black, not yet light, but a deep layered violet that grades imperceptibly to pearl at the horizon.

Mist sits on the water. Dense, soft, still — as if the lake has wrapped itself in a blanket of cloud.

At the far end of the water, a grey heron stands.

She has been there for two hours. She is extraordinary still. A statue. A brushstroke. Her long neck is curved in an S, her sharp beak pointed toward the glassy water. She has a patience that makes the stones seem restless.

A fish rises somewhere near the centre of the lake. The rings spread outward through the mist in perfect circles, growing wider and quieter until they dissolve at the reeds. The heron watches. She does not move.

On the water's surface, lily pads lie open, each one holding a small jewel of dew in its centre that catches what little light exists and turns it silver. The air smells of water and green growing things and the particular clean freshness that comes before the world wakes up.

A family of coots sleeps at the water's edge, their small black heads tucked under their wings, rocking gently with the tiny movements of the water. A moorhen picks its careful way along a fallen branch at the reed bed's edge, its red bill catching the first pale trace of dawn light.

And then the sky begins to change.

So slowly you might miss it if you were not paying this quality of attention — but you are paying this quality of attention, because here, in this particular quiet, there is nothing else to do.

The violet deepens at the horizon, warms toward gold. A single strip of apricot light spreads above the willow line. The mist on the water begins to shift — not dissipate, not yet, but to move, in slow, long spirals, as if the lake is exhaling.

The heron lifts her head. Her eyes catch the first gold of dawn.

She opens her great wings — enormous, slow, entirely silent — and rises from the water without effort, without urgency, trailing the tips of her wings along the surface for just a moment. The mist swirls in her wake. She climbs in long, unhurried wingbeats above the reeds, above the willows, above the lake, until she is a grey shadow against the brightening sky.

She calls once as she goes — a single hoarse, ancient sound that echoes across the water and then is absorbed by it, by the mist, by the dawn.

And the lake is left in perfect quiet.

The water holds the reflection of the pale sky. The lily pads hold their drops of dew. The sleeping coots rock gently.

And you feel yourself held too — suspended between sleep and waking in the most tender and exquisite way, neither here nor there, floating on the surface of something vast and kind.

Let go of the shore. Let the water carry you.

Dawn is coming, but not yet. For now there is only the mist, and the quiet, and the sound of your own breathing growing slower, slower, slower.

Sleep.`
  },
  {
    id: 6,
    title: "The Snow Leopard's Silent Kingdom",
    emoji: "🐆",
    text: `Still your body. Still your mind. The highest mountains in the world are waiting for you, and they have all the patience in the universe.

Imagine you are standing on a wide ledge of ancient grey rock, high in the Himalayas. So high that the air is thin and clean and cold and each breath you take feels like drinking from a mountain spring. The sky above you is black velvet, unpolluted, unmasked — and the stars are not the faint suggestions you see from cities. Here they are blazing and numerous, great dense rivers of light, the arms of the galaxy visible with the naked eye.

Below you, in the darkness, the mountain falls away in vast, slow terraces of rock and snow and sparse alpine grass. Far below — impossibly far — you can see the faint glow of a village, warm orange against the blue-black valley floor. But up here there is only the cold and the silence and the stars.

And the snow leopard.

She emerges from the shadow of a boulder as if she was simply part of the rock until this moment and has only now decided to be a leopard. Her coat is the grey of storm clouds and winter sky, patterned with dark rosettes that break up her outline against the snow, so that she seems to flicker in and out of existence as she moves.

She is enormous and she is impossibly light. She places each great paw on the rock with a precision that makes no sound whatsoever. Not one pebble shifts. Not one grain of snow is disturbed. She simply... flows across the mountain, like water finding the path of least resistance, like thought moving through a quiet mind.

Her thick tail — nearly as long as her body — curves and flows behind her, a soft counterweight to her movements, brushing the snow lightly as she walks.

She reaches the centre of the ledge and stops.

She lifts her pale face to the sky. Her eyes, which in daylight are the colour of glacial water, reflect the stars — pale gold discs in the dark. She holds still for a long time. A very long time. The way only wild things that have never learned to be afraid of silence can be still.

The wind moves across the mountain in long, slow waves. It lifts the fur along her spine and lets it settle. She closes her eyes.

She lowers herself — slowly, with immense ease — onto the flat rock, stretching out her great body along its length, tucking her enormous paws beneath her chest. Her tail wraps around her flank. Her breathing slows until you can barely see it.

She is asleep.

Above her, the stars continue their slow wheel. Orion rises above the eastern peaks. The moon — thin and curved and ancient — clears the ridge and lays a cold silver path across the snow.

The mountain breathes around her. Around you.

You feel the cold stone beneath you, solid and permanent and utterly reliable. You feel the stars above you, vast and indifferent in the most comforting way — their indifference means the universe is doing exactly what it should, turning at exactly the pace it should turn, and you are held within it like a single point of warmth in all that beautiful dark.

The snow leopard breathes. The mountain breathes. You breathe.

In. Out. Slow. Slower.

Sleep now. You are at the top of the world, and the world is holding you, and there is nothing left to do but let the stars spin slowly overhead while you rest in the oldest, deepest, most peaceful quiet that has ever existed.`
  }
];


const quotesData = [
  // Growth
  { text: "You don't have to be perfect to be amazing.", category: "Growth" },
  { text: "Progress matters more than perfection.", category: "Growth" },
  { text: "Every small step counts.", category: "Growth" },
  { text: "Growth often feels uncomfortable before it feels rewarding.", category: "Growth" },
  { text: "Learning is a process, not a race.", category: "Growth" },

  // Self-Love
  { text: "You are worthy of the same kindness you offer others.", category: "Self-Love" },
  { text: "Your value isn't determined by your productivity.", category: "Self-Love" },
  { text: "You deserve rest without guilt.", category: "Self-Love" },
  { text: "Speak to yourself like you would a friend.", category: "Self-Love" },
  { text: "You are enough exactly as you are today.", category: "Self-Love" },

  // Resilience
  { text: "You've survived every difficult day so far.", category: "Resilience" },
  { text: "Hard moments do not last forever.", category: "Resilience" },
  { text: "You are stronger than this temporary challenge.", category: "Resilience" },
  { text: "Keep going; future you will thank you.", category: "Resilience" },
  { text: "Storms eventually pass.", category: "Resilience" },

  // Student Life
  { text: "One assignment at a time.", category: "Student Life" },
  { text: "Progress beats panic.", category: "Student Life" },
  { text: "Learning takes patience.", category: "Student Life" },
  { text: "It's okay to ask for help.", category: "Student Life" },
  { text: "Grades are important, but they don't define you.", category: "Student Life" },

  // Stress Relief
  { text: "Take one deep breath right now.", category: "Stress Relief" },
  { text: "Unclench your jaw.", category: "Stress Relief" },
  { text: "Relax your shoulders.", category: "Stress Relief" },
  { text: "Drink a glass of water.", category: "Stress Relief" },
  { text: "Rest is productive too.", category: "Stress Relief" },

  // Motivation
  { text: "Start before you're ready.", category: "Motivation" },
  { text: "Action creates momentum.", category: "Motivation" },
  { text: "Done is better than perfect.", category: "Motivation" },
  { text: "Focus on the next step.", category: "Motivation" },
  { text: "Consistency wins over intensity.", category: "Motivation" },

  // Relationships
  { text: "Healthy boundaries protect your peace.", category: "Relationships" },
  { text: "Not everyone is meant to stay forever.", category: "Relationships" },
  { text: "Communication creates clarity.", category: "Relationships" },
  { text: "You deserve relationships built on respect.", category: "Relationships" },
  { text: "Your feelings matter.", category: "Relationships" },

  // Core/Original Extras
  { text: "Your speed doesn't matter, forward is forward.", category: "Patience" },
  { text: "Be gentle with yourself. You are doing the best you can.", category: "Grace" },
  { text: "Small progress is still progress. Celebrate your small wins today.", category: "Encouragement" },
  { text: "It's okay to not be okay. Healing is not a straight line.", category: "Validation" }
];

const counselorsData = [
  { name: "Dr. Sarah Jenkins", specialty: "Anxiety & Exam Stress", rating: 4.9, reviews: 120, availability: "Tomorrow", emoji: "👩‍⚕️", tags: ["anxiety", "burnout"] },
  { name: "Mark Rayson", specialty: "Social Anxiety & Relationships", rating: 4.8, reviews: 85, availability: "Today", emoji: "👨‍💼", tags: ["relationships", "anxiety"] },
  { name: "Dr. Amit Patel", specialty: "Academic Burnout & Focus", rating: 4.9, reviews: 144, availability: "Monday", emoji: "👨‍⚕️", tags: ["burnout"] },
  { name: "Sophia Vance", specialty: "Mindfulness & Self-Worth", rating: 4.7, reviews: 92, availability: "Tomorrow", emoji: "👩‍💼", tags: ["anxiety", "relationships"] }
];

const quizQuestions = [
  {
    q: "Over the last 2 weeks, how often have you been feeling down, depressed, or hopeless?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  },
  {
    q: "How often have you had trouble relaxing, or felt easily annoyed/irritable?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  },
  {
    q: "Have you been experiencing trouble sleeping (falling asleep, staying asleep, or sleeping too much)?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  },
  {
    q: "Do you struggle to concentrate on things, such as school work, reading, or watching TV?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  }
];


const musicCategories = [
  {
    id: 'focus',
    label: '🎓 Study Focus',
    icon: '📚',
    description: 'Designed for deep work, coding sessions, assignments, and exam preparation.',
    duration: '20–45 mins',
    accent: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.2)', glow: 'rgba(56, 189, 248, 0.15)' },
    tracks: [
      { id: 'focus-1', title: 'Deep Focus Flow', duration: '35 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
      { id: 'focus-2', title: 'Coding Zone', duration: '28 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
      { id: 'focus-3', title: 'Exam Prep Ambient', duration: '40 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
      { id: 'focus-4', title: 'Library Ambience', duration: '45 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    ]
  },
  {
    id: 'meditation',
    label: '🧘 Meditation & Mindfulness',
    icon: '🧘',
    description: 'Slow your thoughts and reconnect with the present moment.',
    duration: '10–30 mins',
    accent: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.2)', glow: 'rgba(167, 139, 250, 0.15)' },
    tracks: [
      { id: 'med-1', title: 'Zen Garden Meditation', duration: '20 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'med-2', title: 'Floating Clouds', duration: '15 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 'med-3', title: 'Mountain Stillness', duration: '25 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 'med-4', title: 'Mindful Breathing', duration: '10 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    ]
  },
  {
    id: 'anxiety',
    label: '💙 Anxiety Relief & Calm',
    icon: '💙',
    description: 'Reduce mental clutter and create emotional calm.',
    duration: '15–30 mins',
    accent: { color: '#67e8f9', bg: 'rgba(103, 232, 249, 0.08)', border: 'rgba(103, 232, 249, 0.2)', glow: 'rgba(103, 232, 249, 0.15)' },
    tracks: [
      { id: 'anx-1', title: 'Calm Waters', duration: '20 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: 'anx-2', title: 'Gentle Piano Reflections', duration: '18 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
      { id: 'anx-3', title: 'Soft Rain Therapy', duration: '25 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
      { id: 'anx-4', title: 'Peaceful Evening', duration: '30 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
    ]
  },
  {
    id: 'sleep',
    label: '😴 Sleep & Relaxation',
    icon: '🌙',
    description: 'Prepare your mind and body for restful, deep sleep.',
    duration: '20–60 mins',
    accent: { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.08)', border: 'rgba(129, 140, 248, 0.2)', glow: 'rgba(129, 140, 248, 0.18)' },
    tracks: [
      { id: 'sleep-1', title: 'Moonlight Melody', duration: '45 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
      { id: 'sleep-2', title: 'Ocean Dreams', duration: '60 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
      { id: 'sleep-3', title: 'Midnight Lullaby', duration: '30 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
      { id: 'sleep-4', title: 'Rainy Night', duration: '50 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' },
    ]
  }
];

// Flat lookup for all tracks
const allTracksFlat = musicCategories.flatMap(cat =>
  cat.tracks.map(t => ({ ...t, categoryId: cat.id, categoryLabel: cat.label }))
);

const musicRecommendations = [
  { mood: 'distracted', text: 'Feeling distracted?', track: 'Deep Focus Flow', hint: 'Try a deep focus session to lock in.' },
  { mood: 'overwhelmed', text: 'Feeling overwhelmed?', track: 'Calm Waters', hint: 'Let calm sounds ease your mind.' },
  { mood: 'sleepy', text: 'Need better sleep tonight?', track: 'Moonlight Melody', hint: 'Drift off with a soft lullaby soundscape.' },
  { mood: 'anxious', text: 'Feeling anxious?', track: 'Soft Rain Therapy', hint: 'Rain sounds are proven to calm the nervous system.' },
  { mood: 'coding', text: 'Got a coding session?', track: 'Coding Zone', hint: 'Block out noise and get into flow.' },
  { mood: 'stressed', text: 'Feeling stressed?', track: 'Gentle Piano Reflections', hint: 'Soft piano melodies melt tension away.' },
  { mood: 'unfocused', text: 'Struggling to concentrate?', track: 'Deep Focus Flow', hint: 'Frequency-tuned audio for sharper attention.' },
  { mood: 'peaceful', text: 'Want inner peace?', track: 'Zen Garden Meditation', hint: 'Center yourself with a mindful meditation.' },
];



export default function ChatPage({ authToken }) {
  // URL tab search parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'chat';

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // ── States for AI Companion Chat ────────────────────────────
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, activeTab]);

  useEffect(() => {
    if (authToken) {
      const fetchInitialSession = async () => {
        try {
          const res = await fetch('/api/chats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.sessions && data.sessions.length > 0) {
              setSessionId(data.sessions[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to load initial session:', err);
        }
      };
      fetchInitialSession();
    }
  }, [authToken]);

  useEffect(() => {
    if (sessionId) {
      fetchHistory(sessionId);
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  const fetchHistory = async (id) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const loadedMessages = data.messages.map(m => ({
          role: m.role,
          text: m.content,
          time: m.created_at
        }));
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textOverride) => {
    const text = textOverride || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user', text: text, time: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    detectThemeFromText(text);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      const data = await response.json();
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

      const botMsg = {
        role: 'bot',
        text: data.reply || "I'm sorry, I encountered an error. Please try again.",
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // ── States for Self Care ─────────────────────────────────────
  const [breathState, setBreathState] = useState('idle'); // 'idle', 'inhale', 'hold', 'exhale'
  const [breathTimer, setBreathTimer] = useState(4);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_saved_quotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [gratitudeInput, setGratitudeInput] = useState('');
  const [gratitudes, setGratitudes] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_gratitudes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isJarAnimating, setIsJarAnimating] = useState(false);

  // Breathing timer loop
  useEffect(() => {
    if (breathState === 'idle') return;
    const interval = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) {
          if (breathState === 'inhale') {
            setBreathState('hold');
            return 4;
          } else if (breathState === 'hold') {
            setBreathState('exhale');
            return 4;
          } else {
            setBreathState('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathState]);

  const drawFortuneCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotesData.length);
      setCurrentQuote(quotesData[randomIndex]);
      setIsFlipped(true);
    }, 250);
  };

  const handleSaveQuote = (quote) => {
    if (!savedQuotes.some(q => q.text === quote.text)) {
      const updated = [...savedQuotes, quote];
      setSavedQuotes(updated);
      localStorage.setItem('novara_saved_quotes', JSON.stringify(updated));
    }
  };

  const handleRemoveQuote = (text) => {
    const updated = savedQuotes.filter(q => q.text !== text);
    setSavedQuotes(updated);
    localStorage.setItem('novara_saved_quotes', JSON.stringify(updated));
  };

  const handleDropGratitude = (e) => {
    e.preventDefault();
    if (!gratitudeInput.trim()) return;
    setIsJarAnimating(true);
    const text = gratitudeInput.trim();
    setGratitudeInput('');
    setTimeout(() => {
      const updated = [text, ...gratitudes];
      setGratitudes(updated);
      localStorage.setItem('novara_gratitudes', JSON.stringify(updated));
      setIsJarAnimating(false);
    }, 800);
  };

  // ── States for Self Tests ────────────────────────────────────
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleQuizAnswer = (score) => {
    const nextScore = quizScore + score;
    setQuizScore(nextScore);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  // ── States for Counselor Booking ───────────────────────────
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // ── States for Music Page ────────────────────────────────────
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const audioRef = useRef(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [musicVolume, setMusicVolume] = useState(() => {
    try { return parseInt(localStorage.getItem('novara_music_volume') || '80', 10); } catch { return 80; }
  });
  const [favoritedTracks, setFavoritedTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_favorited_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  // Stable random recommendation per mount
  const [todayRecommendation] = useState(() =>
    musicRecommendations[Math.floor(Math.random() * musicRecommendations.length)]
  );

  const handleProgressChange = (e) => {
    const progressVal = Number(e.target.value);
    setTrackProgress(progressVal);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (progressVal / 100) * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setMusicVolume(vol);
    localStorage.setItem('novara_music_volume', String(vol));
    if (audioRef.current) audioRef.current.volume = vol / 100;
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const toggleFavoriteTrack = (id) => {
    let updated;
    if (favoritedTracks.includes(id)) {
      updated = favoritedTracks.filter(tid => tid !== id);
    } else {
      updated = [...favoritedTracks, id];
    }
    setFavoritedTracks(updated);
    localStorage.setItem('novara_favorited_tracks', JSON.stringify(updated));
  };

  const playTrack = (track, categoryLabel) => {
    setPlayingTrack({ ...track, categoryLabel });
    setIsMusicPlaying(true);
  };

  const handlePrevTrack = () => {
    if (!playingTrack) return;
    const idx = allTracksFlat.findIndex(t => t.id === playingTrack.id);
    const prevIdx = idx <= 0 ? allTracksFlat.length - 1 : idx - 1;
    const prev = allTracksFlat[prevIdx];
    const cat = musicCategories.find(c => c.id === prev.categoryId);
    setPlayingTrack({ ...prev, categoryLabel: cat?.label || '' });
    setIsMusicPlaying(true);
  };

  const handleNextTrack = () => {
    if (!playingTrack) return;
    const idx = allTracksFlat.findIndex(t => t.id === playingTrack.id);
    const nextIdx = idx >= allTracksFlat.length - 1 ? 0 : idx + 1;
    const next = allTracksFlat[nextIdx];
    const cat = musicCategories.find(c => c.id === next.categoryId);
    setPlayingTrack({ ...next, categoryLabel: cat?.label || '' });
    setIsMusicPlaying(true);
  };

  // Initialize audio object
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = musicVolume / 100;

    const handleTimeUpdate = () => {
      if (audioRef.current && audioRef.current.duration) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setTrackProgress(progress);
        setAudioCurrentTime(audioRef.current.currentTime);
      }
    };
    const handleEnded = () => handleNextTrack();

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  // Sync playback state
  useEffect(() => {
    if (!audioRef.current) return;
    if (playingTrack) {
      const targetUrl = new URL(playingTrack.url, window.location.href).href;
      if (audioRef.current.src !== targetUrl) {
        audioRef.current.src = playingTrack.url;
        audioRef.current.load();
      }
      if (isMusicPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Autoplay blocked:', err);
          setIsMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [playingTrack, isMusicPlaying]);

  // ── States for Unwind Soundboard Mix ─────────────────────────
  const [rainVol, setRainVol] = useState(40);
  const [forestVol, setForestVol] = useState(0);
  const [oceanVol, setOceanVol] = useState(20);
  const [whiteVol, setWhiteVol] = useState(0);

  // ── States for Bedtime Story ──────────────────────────────────
  const [currentStoryIndex] = useState(() => {
    try {
      const visitCount = parseInt(localStorage.getItem('novara_story_visit') || '0', 10);
      const nextVisit = visitCount + 1;
      localStorage.setItem('novara_story_visit', String(nextVisit));
      return visitCount % bedtimeStories.length;
    } catch {
      return 0;
    }
  });
  const [isNarrating, setIsNarrating] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0); // 0 = cover, 1 = reading
  const speechRef = useRef(null);

  const currentStory = bedtimeStories[currentStoryIndex];

  const handleStartNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support voice narration. Try Chrome or Edge.');
      return;
    }
    // Voices may not be loaded yet — wait for them
    const speakWithVoice = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStory.text);
      // Ultra-slow, ultra-soft — like floating on a cloud
      utterance.rate = 0.62;   // very slow, dreamy pace
      utterance.pitch = 1.15;  // slightly higher = softer feminine tone
      utterance.volume = 0.92;
      // Priority list of soft female English voices across platforms
      const voices = window.speechSynthesis.getVoices();
      const femaleNames = ['samantha', 'victoria', 'karen', 'moira', 'tessa', 'zira', 'hazel', 'susan', 'fiona', 'serena', 'emily', 'kate', 'aria', 'jenny', 'salli', 'joanna', 'ivy', 'kendra', 'kimberly'];
      const preferred =
        voices.find(v => v.lang.startsWith('en') && femaleNames.some(n => v.name.toLowerCase().includes(n))) ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang === 'en-AU') ||
        voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    };
    // If voices aren't ready yet, wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speakWithVoice();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
    }
  };

  const handleStopNarration = () => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis && window.speechSynthesis.cancel(); };
  }, []);

  // ── States for Daily Planner Plan Ur Day ─────────────────────
  const [newTaskText, setNewTaskText] = useState('');
  const [plannerTasks, setPlannerTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_planner_tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "Complete DBMS assignment", completed: false },
        { id: 2, text: "Drink 2 litres of water", completed: true },
        { id: 3, text: "Take a 15 minute walk", completed: true },
        { id: 4, text: "Revise DAA concepts", completed: true }
      ];
    } catch {
      return [];
    }
  });

  const [selectedMood, setSelectedMood] = useState(() => {
    return localStorage.getItem('novara_daily_mood') || '';
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false
    };
    const updated = [...plannerTasks, newTask];
    setPlannerTasks(updated);
    localStorage.setItem('novara_planner_tasks', JSON.stringify(updated));
    setNewTaskText('');
  };

  const handleToggleTask = (id) => {
    const updated = plannerTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setPlannerTasks(updated);
    localStorage.setItem('novara_planner_tasks', JSON.stringify(updated));
  };

  const handleDeleteTask = (id) => {
    const updated = plannerTasks.filter(t => t.id !== id);
    setPlannerTasks(updated);
    localStorage.setItem('novara_planner_tasks', JSON.stringify(updated));
  };

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    localStorage.setItem('novara_daily_mood', mood);
  };


  // ── Helper Panels Rendering Functions ─────────────────────────

  const renderSelfCarePanel = () => {
    return (
      <div className="panel-container self-care-panel">
        <div className="panel-header-section">
          <h2>🌿 Self Care Space</h2>
          <p>Nurture your mental energy and relax with tools designed for immediate relief.</p>
        </div>

        <div className="self-care-grid">

          {/* Card 1: Breathing Exercise */}
          <div className="panel-card breathing-card">
            <h3>🫁 Visual Deep Breathing</h3>
            <p className="card-sub">Relieve stress instantly with rhythmic pacing.</p>

            <div className="breathing-content">
              <div className={`breathing-circle ${breathState}`}>
                <div className="breath-label">
                  {breathState === 'idle' ? 'Start' : breathState.toUpperCase()}
                </div>
                {breathState !== 'idle' && <div className="breath-countdown">{breathTimer}s</div>}
              </div>

              <div className="breathing-controls">
                {breathState === 'idle' ? (
                  <button className="care-action-btn primary" onClick={() => { setBreathState('inhale'); setBreathTimer(4); }}>
                    Begin Exercise
                  </button>
                ) : (
                  <button className="care-action-btn secondary" onClick={() => setBreathState('idle')}>
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Fortune Affirmations Deck */}
          <div className="panel-card fortune-deck-card">
            <h3>🔮 Nova Wisdom Cards</h3>
            <p className="card-sub">Draw a wellness quote card to guide your day.</p>

            <div className="fortune-shuffler-content">
              <div className={`flip-card-container ${isFlipped ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                  {/* Card Front (Deck back graphic) */}
                  <div className="flip-card-front" onClick={drawFortuneCard}>
                    <div className="deck-art">🌻</div>
                    <span className="deck-action-label">Click to Draw Card</span>
                  </div>
                  {/* Card Back (Revealed content) */}
                  <div className="flip-card-back">
                    {currentQuote && (
                      <div className="revealed-quote-layout">
                        <span className="quote-tag">{currentQuote.category}</span>
                        <p className="quote-message">"{currentQuote.text}"</p>
                        <div className="quote-actions">
                          <button className="save-card-btn" onClick={() => handleSaveQuote(currentQuote)}>
                            ❤️ Save Card
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="deck-controls">
                <button className="care-action-btn primary" onClick={drawFortuneCard}>
                  Draw & Shuffle Deck
                </button>
              </div>

              {savedQuotes.length > 0 && (
                <div className="saved-cards-collection">
                  <h4>📁 Saved Affirmations ({savedQuotes.length})</h4>
                  <div className="saved-quotes-list">
                    {savedQuotes.map((q, idx) => (
                      <div key={idx} className="saved-quote-item">
                        <span>"{q.text}" ({q.category})</span>
                        <button className="remove-saved-btn" onClick={() => handleRemoveQuote(q.text)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Virtual Gratitude Jar */}
          <div className="panel-card gratitude-jar-card">
            <h3>🍯 Virtual Gratitude Jar</h3>
            <p className="card-sub">Write down something positive to drop into your digital jar.</p>

            <div className="gratitude-jar-content">
              <form onSubmit={handleDropGratitude} className="gratitude-form">
                <input
                  type="text"
                  placeholder="Today, I am grateful for..."
                  value={gratitudeInput}
                  onChange={(e) => setGratitudeInput(e.target.value)}
                  disabled={isJarAnimating}
                />
                <button type="submit" className="care-action-btn primary" disabled={!gratitudeInput.trim() || isJarAnimating}>
                  {isJarAnimating ? 'Dropping...' : 'Drop in Jar'}
                </button>
              </form>

              <div className="jar-visual-container">
                <div className={`jar-glass ${isJarAnimating ? 'glow' : ''}`}>
                  <div className="jar-lid"></div>
                  <div className="jar-contents-label">✨ {gratitudes.length} Memories</div>
                  {isJarAnimating && <div className="floating-paper">📝</div>}
                </div>
              </div>

              {gratitudes.length > 0 && (
                <div className="gratitude-history">
                  <h4>📖 Gratitude Journal</h4>
                  <div className="gratitude-scroll">
                    {gratitudes.map((g, i) => (
                      <div key={i} className="gratitude-journal-note">
                        <span className="journal-bullet">✦</span> {g}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderSelfTestsPanel = () => {
    return (
      <div className="panel-container self-tests-panel">
        <div className="panel-header-section">
          <h2>📝 Self Tests Assessment</h2>
          <p>Evaluate your current feelings. These metrics help identify patterns and build healthy coping guides.</p>
        </div>

        <div className="tests-workspace">
          <div className="panel-card test-card-hero">
            {!quizStarted && !quizCompleted ? (
              <div className="quiz-intro">
                <span className="quiz-badge">Stress & Anxiety</span>
                <h3>Student Stress & Mental Wellness Quiz</h3>
                <p>A quick 4-question scale derived from professional counseling assessment structures to evaluate your workload and recovery stress levels.</p>
                <div className="quiz-details">
                  <span>⏰ Takes 1 min</span>
                  <span>🔒 Fully Confidential</span>
                </div>
                <button className="care-action-btn primary start-quiz-btn" onClick={() => setQuizStarted(true)}>
                  Start Assessment
                </button>
              </div>
            ) : quizStarted && !quizCompleted ? (
              <div className="quiz-active-question">
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}></div>
                </div>
                <span className="question-counter">Question {quizIndex + 1} of {quizQuestions.length}</span>
                <h3>{quizQuestions[quizIndex].q}</h3>

                <div className="quiz-options-list">
                  {quizQuestions[quizIndex].options.map((opt, i) => (
                    <button key={i} className="quiz-option-btn" onClick={() => handleQuizAnswer(opt.score)}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="quiz-results">
                <h3>Assessment Complete!</h3>
                <div className="score-badge">Your Score: {quizScore} / 12</div>

                <div className="score-breakdown-card">
                  {quizScore <= 4 ? (
                    <div>
                      <h4 className="score-title healthy">🟢 Healthy / Low Stress</h4>
                      <p>You seem to be managing your balance well. Continue integrating regular wellness micro-pauses like listening to ambient soundscapes or planning your schedule.</p>
                    </div>
                  ) : quizScore <= 8 ? (
                    <div>
                      <h4 className="score-title mild">🟡 Mild Stress & Burnout Risk</h4>
                      <p>Your scores suggest mild emotional weight. We recommend visiting our **Self Care** section to practice visual box breathing and logging daily wins in your Gratitude Jar.</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="score-title high">🔴 Elevated Stress Levels</h4>
                      <p>You are managing a heavy emotional load right now. We strongly advise taking a break, speaking to our empathetic AI companion, or visiting the **Talk to Counsellor** portal to secure a safe guidance conversation.</p>
                    </div>
                  )}
                </div>

                <div className="results-actions">
                  <button className="care-action-btn secondary" onClick={resetQuiz}>Take Quiz Again</button>
                  <button className="care-action-btn primary" onClick={() => setActiveTab('counselor')}>Talk to Counsellor</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCounselorPanel = () => {
    const filteredCounselors = counselorFilter === 'all'
      ? counselorsData
      : counselorsData.filter(c => c.tags.includes(counselorFilter));

    return (
      <div className="panel-container counselor-panel">
        <div className="panel-header-section">
          <h2>🧑‍⚕️ Talk to Counsellor</h2>
          <p>Book confidential, high-quality counseling matches tailored to student academics and general emotional healing.</p>
        </div>

        <div className="counselor-workspace">
          <div className="filter-row">
            <span>Filter Specialty:</span>
            {['all', 'anxiety', 'relationships', 'burnout'].map((tag) => (
              <button
                key={tag}
                className={`filter-tag-btn ${counselorFilter === tag ? 'active' : ''}`}
                onClick={() => setCounselorFilter(tag)}
              >
                {tag.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="counselors-grid">
            {filteredCounselors.map((c, i) => (
              <div key={i} className="panel-card counselor-card">
                <div className="counselor-profile">
                  <span className="counselor-avatar">{c.emoji}</span>
                  <div className="counselor-info">
                    <h3>{c.name}</h3>
                    <p className="counselor-specialty">{c.specialty}</p>
                    <div className="counselor-rating">
                      ⭐️ <strong>{c.rating}</strong> ({c.reviews} ratings)
                    </div>
                  </div>
                </div>
                <div className="counselor-meta">
                  <span className="availability-tag">📅 Next Available: {c.availability}</span>
                </div>
                <button className="care-action-btn primary book-btn" onClick={() => { setSelectedCounselor(c); setBookingConfirmed(false); }}>
                  Schedule Match
                </button>
              </div>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedCounselor && (
            <div className="modal-overlay">
              <div className="modal-content glassmorphism booking-modal">
                <button className="modal-close" onClick={() => setSelectedCounselor(null)}>✕</button>
                {!bookingConfirmed ? (
                  <>
                    <h3>Confirm Booking Session</h3>
                    <p>Requesting counseling session match with **{selectedCounselor.name}**.</p>

                    <div className="counselor-preview-box">
                      <span>{selectedCounselor.emoji}</span>
                      <div>
                        <strong>{selectedCounselor.name}</strong>
                        <p>{selectedCounselor.specialty}</p>
                      </div>
                    </div>

                    <div className="booking-form-box">
                      <label>Preferred Session Type:</label>
                      <select className="booking-select">
                        <option>Video Call (Confidential)</option>
                        <option>Voice Call</option>
                        <option>Chat Messaging Session</option>
                      </select>

                      <label>Preferred Time Slot:</label>
                      <select className="booking-select">
                        <option>Tomorrow at 10:00 AM</option>
                        <option>Tomorrow at 2:00 PM</option>
                        <option>Next available slot ({selectedCounselor.availability})</option>
                      </select>
                    </div>

                    <div className="modal-actions">
                      <button className="care-action-btn secondary" onClick={() => setSelectedCounselor(null)}>Cancel</button>
                      <button className="care-action-btn primary" onClick={() => setBookingConfirmed(true)}>Confirm Reservation</button>
                    </div>
                  </>
                ) : (
                  <div className="booking-success-message">
                    <span className="success-icon">✅</span>
                    <h3>Session Requested!</h3>
                    <p>Your matching request has been submitted. A counseling coordinator will message you with the link to join once **{selectedCounselor.name}** accepts.</p>
                    <button className="care-action-btn primary" onClick={() => setSelectedCounselor(null)}>Close</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMusicPanel = () => {
    const favoritedTrackObjects = allTracksFlat.filter(t => favoritedTracks.includes(t.id));

    return (
      <div className="panel-container music-hub-panel">

        {/* ── Page Header ── */}
        <div className="music-hub-header">
          <div>
            <h2 className="music-hub-title">🎵 Focus &amp; Wellness Music</h2>
            <p className="music-hub-subtitle">Curated soundscapes to help you focus, relax, recharge, and sleep better.</p>
          </div>
          <div className="music-page-stats">
            <span className="music-stat-chip">🎵 16+ Tracks</span>
            <span className="music-stat-chip">📂 4 Categories</span>
            <span className="music-stat-chip">🧘 Stress Relief &amp; Focus</span>
          </div>
        </div>

        {/* ── Category Cards Grid ── */}
        <div className="music-categories-grid">
          {musicCategories.map(cat => (
            <div
              key={cat.id}
              className="music-cat-card"
              style={{ borderColor: cat.accent.border, background: cat.accent.bg }}
            >
              <div className="music-cat-header">
                <div className="music-cat-title-group">
                  <span className="music-cat-icon">{cat.icon}</span>
                  <div>
                    <h3 className="music-cat-title" style={{ color: cat.accent.color }}>{cat.label}</h3>
                    <p className="music-cat-desc">{cat.description}</p>
                  </div>
                </div>
                <span className="music-cat-duration-badge" style={{ color: cat.accent.color, borderColor: cat.accent.border }}>
                  ⏱ {cat.duration}
                </span>
              </div>

              <div className="music-track-list">
                {cat.tracks.map(track => {
                  const isActive = playingTrack && playingTrack.id === track.id;
                  const isFav = favoritedTracks.includes(track.id);
                  return (
                    <div
                      key={track.id}
                      className={`music-track-row ${isActive ? 'active' : ''}`}
                      style={isActive ? { boxShadow: `0 0 14px ${cat.accent.glow}`, borderColor: cat.accent.border } : {}}
                    >
                      <button
                        className="music-play-btn"
                        style={isActive ? { color: cat.accent.color } : {}}
                        onClick={() => {
                          if (isActive) {
                            setIsMusicPlaying(!isMusicPlaying);
                          } else {
                            playTrack(track, cat.label);
                          }
                        }}
                      >
                        {isActive && isMusicPlaying ? '⏸' : '▶'}
                      </button>
                      <span className="music-track-title" onClick={() => playTrack(track, cat.label)}>
                        {track.title}
                        {isActive && isMusicPlaying && <span className="music-playing-dot">●</span>}
                      </span>
                      <span className="music-track-duration">⏱ {track.duration}</span>
                      <button
                        className={`music-fav-btn ${isFav ? 'active' : ''}`}
                        onClick={e => { e.stopPropagation(); toggleFavoriteTrack(track.id); }}
                        title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Recommended Today ── */}
        <div className="music-recommendation-card">
          <div className="rec-card-inner">
            <div className="rec-card-left">
              <span className="rec-sparkle">✨</span>
              <div>
                <p className="rec-card-label">Recommended Today</p>
                <p className="rec-card-text">
                  <strong>{todayRecommendation.text}</strong> Try <em>{todayRecommendation.track}</em>.
                </p>
                <p className="rec-card-hint">{todayRecommendation.hint}</p>
              </div>
            </div>
            <button
              className="rec-play-btn"
              onClick={() => {
                const found = allTracksFlat.find(t => t.title === todayRecommendation.track);
                if (found) {
                  const cat = musicCategories.find(c => c.id === found.categoryId);
                  playTrack(found, cat?.label || '');
                }
              }}
            >
              ▶ Play Now
            </button>
          </div>
        </div>

        {/* ── Saved Favorites ── */}
        <div className="music-favorites-section">
          <h3 className="music-favorites-title">❤️ Saved Favorites</h3>
          {favoritedTrackObjects.length === 0 ? (
            <p className="music-favorites-empty">No favorite tracks yet. Click the 🤍 on any track to save it here.</p>
          ) : (
            <div className="music-favorites-grid">
              {favoritedTrackObjects.map(track => {
                const cat = musicCategories.find(c => c.id === track.categoryId);
                const isActive = playingTrack && playingTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={`music-fav-item ${isActive ? 'active' : ''}`}
                    style={cat ? { borderColor: cat.accent.border } : {}}
                  >
                    <button
                      className="music-play-btn"
                      onClick={() => {
                        if (isActive) setIsMusicPlaying(!isMusicPlaying);
                        else if (cat) playTrack(track, cat.label);
                      }}
                    >
                      {isActive && isMusicPlaying ? '⏸' : '▶'}
                    </button>
                    <div className="music-fav-info">
                      <span className="music-track-title">{track.title}</span>
                      {cat && <span className="music-fav-category" style={{ color: cat.accent.color }}>{cat.label}</span>}
                    </div>
                    <span className="music-track-duration">⏱ {track.duration}</span>
                    <button
                      className="music-fav-btn active"
                      onClick={() => toggleFavoriteTrack(track.id)}
                    >❤️</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Floating Mini Player ── */}
        {playingTrack && (
          <div className="music-mini-player">
            <div className="mini-player-artwork">🎵</div>
            <div className="mini-player-info">
              <span className="mini-player-track">{playingTrack.title}</span>
              <span className="mini-player-category">{playingTrack.categoryLabel}</span>
            </div>
            <div className="mini-player-controls">
              <button className="mini-ctrl-btn" onClick={handlePrevTrack}>⏮</button>
              <button className="mini-ctrl-btn mini-ctrl-play" onClick={() => setIsMusicPlaying(!isMusicPlaying)}>
                {isMusicPlaying ? '⏸' : '▶'}
              </button>
              <button className="mini-ctrl-btn" onClick={handleNextTrack}>⏭</button>
            </div>
            <div className="mini-player-progress-block">
              <span className="mini-time">{formatTime(audioCurrentTime)}</span>
              <input
                type="range"
                className="mini-player-progress"
                min="0" max="100"
                value={trackProgress}
                onChange={handleProgressChange}
              />
              <span className="mini-time">{playingTrack.duration}</span>
            </div>
            <div className="mini-player-volume-block">
              <span>🔊</span>
              <input
                type="range"
                className="mini-player-volume"
                min="0" max="100"
                value={musicVolume}
                onChange={handleVolumeChange}
              />
            </div>
            <button className="mini-close-btn" onClick={() => { setPlayingTrack(null); setIsMusicPlaying(false); }}>✕</button>
          </div>
        )}

      </div>
    );
  };


  const renderSleepPanel = () => {
    return (
      <div className="panel-container sleep-panel">
        <div className="panel-header-section">
          <h2>💤 Unwind and Sleep</h2>
          <p>Drift into deep, refreshing sleep with ambient sounds and a soothing bedtime story.</p>
        </div>

        <div className="sleep-workspace">

          {/* ─ BEDTIME STORY ─ */}
          <div className="bedtime-story-card panel-card">
            {/* Floating stars background */}
            <div className="story-stars">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="story-star" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${(i * 0.4) % 3}s`,
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`
                }} />
              ))}
            </div>

            <div className="story-moon">🌙</div>

            {storyProgress === 0 ? (
              /* Story Cover Screen */
              <div className="story-cover">
                <div className="story-cover-emoji">{currentStory.emoji}</div>
                <div className="story-night-label">Tonight's Bedtime Story</div>
                <h3 className="story-cover-title">{currentStory.title}</h3>
                <p className="story-cover-hint">A new story greets you every visit — told in the gentle voice of someone who loves you.</p>
                <div className="story-cover-actions">
                  <button className="care-action-btn primary story-read-btn" onClick={() => setStoryProgress(1)}>
                    📖 Read Story
                  </button>
                  <button
                    className={`care-action-btn ${isNarrating ? 'narrating-active' : 'secondary'} story-listen-btn`}
                    onClick={() => { setStoryProgress(1); if (!isNarrating) handleStartNarration(); }}
                  >
                    {isNarrating ? '🔊 Narrating...' : '🎙️ Listen & Sleep'}
                  </button>
                </div>
                <div className="story-visit-badge">Story #{currentStoryIndex + 1} of {bedtimeStories.length}</div>
              </div>
            ) : (
              /* Story Reading Screen */
              <div className="story-reading">
                <div className="story-reading-header">
                  <span className="story-emoji-sm">{currentStory.emoji}</span>
                  <h3 className="story-reading-title">{currentStory.title}</h3>
                </div>

                <div className="story-text-scroll">
                  {currentStory.text.split('\n\n').map((para, i) => (
                    <p key={i} className="story-paragraph">{para}</p>
                  ))}
                </div>

                <div className="story-reading-controls">
                  {isNarrating ? (
                    <button className="care-action-btn narrating-active" onClick={handleStopNarration}>
                      ⏹ Stop Narration
                    </button>
                  ) : (
                    <button className="care-action-btn secondary" onClick={handleStartNarration}>
                      🎙️ Narrate Story
                    </button>
                  )}
                  <button className="care-action-btn secondary" onClick={() => { handleStopNarration(); setStoryProgress(0); }}>
                    ← Back to Cover
                  </button>
                </div>

                {isNarrating && (
                  <div className="narration-status">
                    <span className="narration-dot" />
                    <span className="narration-dot" />
                    <span className="narration-dot" />
                    <span>Narrating softly...</span>
                  </div>
                )}
              </div>
            )}
          </div>



          {/* ─ SLEEP RITUAL ─ */}
          <div className="sleep-guide-tip panel-card">
            <h3>🛌 2-Minute Guided Sleep Ritual</h3>
            <p className="card-sub">Follow this wind-down breathing routine in bed before closing your eyes:</p>
            <div className="sleep-instructions">
              <div className="step-row"><span className="step-num">1</span> <p>Inhale quietly through your nose for <strong>4 seconds</strong>.</p></div>
              <div className="step-row"><span className="step-num">2</span> <p>Hold your breath gently for <strong>7 seconds</strong>.</p></div>
              <div className="step-row"><span className="step-num">3</span> <p>Exhale completely through your mouth, making a "whoosh" sound, for <strong>8 seconds</strong>.</p></div>
              <div className="step-row"><span className="step-num">4</span> <p>Repeat this cycle 4 times. Feel your heart rate fall as you prepare to sleep.</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlanPanel = () => {
    const totalTasks = plannerTasks.length;
    const completedTasks = plannerTasks.filter(t => t.completed).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // SVG circular progress calculation
    const radius = 50;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Today's Focus: first uncompleted task
    const nextFocusTask = plannerTasks.find(t => !t.completed) || null;

    // Time-of-day contextual nudge
    const hour = new Date().getHours();
    const timeGreeting = hour >= 5 && hour < 12
      ? { icon: '🌅', label: 'Morning Energy', msg: 'Start with your easiest task — build momentum gently.' }
      : hour >= 12 && hour < 17
        ? { icon: '☀️', label: 'Afternoon Check-in', msg: 'Take a deep breath. You\'re making progress, one step at a time.' }
        : hour >= 17 && hour < 21
          ? { icon: '🌙', label: 'Evening Wind-down', msg: 'Wrap up one small thing before you rest tonight.' }
          : { icon: '🌃', label: 'Late Night', msg: 'Rest is productive too. Don\'t forget to take care of yourself.' };

    const moodNames = {
      '😔': 'Sad',
      '😐': 'Neutral',
      '🙂': 'Good',
      '😄': 'Happy',
      '🤩': 'Excited'
    };

    const moodThemes = {
      '😔': {
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(17, 24, 39, 0.7) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.35)',
        boxShadow: '0 8px 40px rgba(59, 130, 246, 0.2), inset 0 0 60px rgba(59, 130, 246, 0.05)',
        accentColor: '#60a5fa'
      },
      '😐': {
        background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.4) 0%, rgba(17, 24, 39, 0.7) 100%)',
        borderColor: 'rgba(107, 114, 128, 0.35)',
        boxShadow: '0 8px 32px rgba(107, 114, 128, 0.15)',
        accentColor: '#9ca3af'
      },
      '🙂': {
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(17, 24, 39, 0.7) 100%)',
        borderColor: 'rgba(52, 211, 153, 0.35)',
        boxShadow: '0 8px 40px rgba(52, 211, 153, 0.18), inset 0 0 60px rgba(52, 211, 153, 0.05)',
        accentColor: '#34d399'
      },
      '😄': {
        background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.4) 0%, rgba(17, 24, 39, 0.7) 100%)',
        borderColor: 'rgba(251, 191, 36, 0.35)',
        boxShadow: '0 8px 40px rgba(251, 191, 36, 0.2), inset 0 0 60px rgba(251, 191, 36, 0.05)',
        accentColor: '#fbbf24'
      },
      '🤩': {
        background: 'linear-gradient(135deg, rgba(91, 33, 182, 0.5) 0%, rgba(126, 34, 206, 0.25) 50%, rgba(17, 24, 39, 0.7) 100%)',
        borderColor: 'rgba(167, 139, 250, 0.5)',
        boxShadow: '0 12px 60px rgba(167, 139, 250, 0.35), inset 0 0 80px rgba(167, 139, 250, 0.08)',
        accentColor: '#a78bfa'
      }
    };

    const activeMoodTheme = selectedMood ? moodThemes[selectedMood] : null;

    return (
      <div className="panel-container planner-panel">
        <div className="panel-header-section">
          <h2>📅 Plan Your Day</h2>
          <p className="panel-subtitle">A simple space to organize your day, build healthy habits, and stay mindful.</p>
        </div>

        <div className="planner-dashboard">
          {/* Main Dashboard Row */}
          <div className="planner-grid">

            {/* Card 1: Today's Intentions */}
            <div className="planner-card intentions-card">
              <div className="card-header-group">
                <h3>✨ Today's Intentions</h3>
                <p className="card-desc">Set small, meaningful goals for today.</p>
              </div>

              <form onSubmit={handleAddTask} className="planner-form">
                <input
                  type="text"
                  placeholder="Add a daily intention (e.g., Drink water, study)..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
                <button type="submit" className="care-action-btn primary add-task-btn">
                  Add Task
                </button>
              </form>

              <div className="planner-tasks-list">
                {plannerTasks.length === 0 ? (
                  <p className="empty-planner-msg">No tasks added for today yet. Make it a peaceful list!</p>
                ) : (
                  plannerTasks.map((task) => (
                    <div key={task.id} className={`planner-task-item ${task.completed ? 'completed' : ''}`}>
                      <div className="task-left" onClick={() => handleToggleTask(task.id)}>
                        <div className="task-checkbox-wrapper">
                          <span className={`task-checkbox-custom ${task.completed ? 'checked' : ''}`}>
                            {task.completed && '✓'}
                          </span>
                        </div>
                        <span className="task-text">{task.text}</span>
                      </div>
                      <button className="delete-task-btn" onClick={() => handleDeleteTask(task.id)} title="Delete Task">✕</button>
                    </div>
                  ))
                )}
              </div>

              <div className="planner-summary">
                <span>{completedTasks} of {totalTasks} goals completed</span>
              </div>
            </div>

            {/* Card 2: Progress Tracker */}
            <div className="planner-card progress-card">
              <h3>📈 Progress Tracker</h3>

              <div className="progress-ring-container">
                <div className="progress-ring-wrapper">
                  <svg width="120" height="120" className="progress-ring">
                    <circle
                      className="progress-ring-bg"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      r={radius}
                      cx="60"
                      cy="60"
                    />
                    <circle
                      className="progress-ring-circle"
                      stroke="#a2e024"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      r={radius}
                      cx="60"
                      cy="60"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="progress-percentage-text">{percentage}%</div>
                </div>
                <div className="progress-text-details">
                  <span className="progress-label">Tasks Completed</span>
                  <span className="progress-value">{completedTasks} / {totalTasks}</span>
                </div>
              </div>

              <div className="tracker-extras">
                {/* Today's Focus */}
                <div className="focus-section">
                  <p className="focus-label">🎯 Today's Focus</p>
                  {nextFocusTask ? (
                    <div className="focus-task-pill">
                      <span className="focus-task-text">{nextFocusTask.text}</span>
                    </div>
                  ) : (
                    <div className="focus-task-pill all-done">
                      <span className="focus-task-text">🎉 All done for today!</span>
                    </div>
                  )}
                </div>

                {/* Time-based nudge */}
                <div className="time-nudge">
                  <p className="time-nudge-label">{timeGreeting.icon} {timeGreeting.label}</p>
                  <p className="time-nudge-msg">{timeGreeting.msg}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Mood Check-In Section */}
          <div
            className="planner-card mood-checkin-card"
            style={activeMoodTheme ? {
              background: activeMoodTheme.background,
              borderColor: activeMoodTheme.borderColor,
              boxShadow: activeMoodTheme.boxShadow,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            } : { transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <h3>😊 Mood Check-In</h3>
            <p className="card-desc">How are you feeling today?</p>

            <div className="mood-emojis-container">
              {['😔', '😐', '🙂', '😄', '🤩'].map((moodEmoji) => (
                <button
                  key={moodEmoji}
                  className={`mood-emoji-btn ${selectedMood === moodEmoji ? 'active' : ''}`}
                  style={selectedMood === moodEmoji && moodThemes[moodEmoji] ? {
                    filter: `drop-shadow(0 0 14px ${moodThemes[moodEmoji].accentColor})`,
                    backgroundColor: `${moodThemes[moodEmoji].accentColor}18`,
                    borderColor: `${moodThemes[moodEmoji].accentColor}44`
                  } : {}}
                  onClick={() => handleSelectMood(moodEmoji)}
                >
                  {moodEmoji}
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="mood-display" style={{ borderTopColor: `${activeMoodTheme?.accentColor}30` }}>
                <span style={{ color: '#d1d5db' }}>Today's Mood: </span>
                <strong style={{ color: activeMoodTheme?.accentColor || '#a2e024', fontSize: '1.05rem' }}>
                  {moodNames[selectedMood]}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // ── Main Page Render ──────────────────────────────────────────

  return (
    <div className="chat-page-layout">
      <ChatSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="chat-page-main">
        <ChatHeader />

        {activeTab === 'chat' && (
          <>
            <div className="chat-messages-container" ref={chatContainerRef}>
              {messages.length === 0 && (
                <div className="chat-empty-state">
                  <AnimatedMascot />
                  <div className="empty-state-card">
                    Hi, I am Nova, your daily AI Mental Health Companion! 🌻
                  </div>
                  <div className="empty-state-card">
                    So tell me how's it going? Anything on your mind lately.
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`chat-message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                  <span className="chat-timestamp">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="chat-message-row bot typing">
                  <div className="chat-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-wrapper">
              <div className="chat-input-box">
                <span className="attachment-icon">📎</span>
                <input
                  type="text"
                  placeholder="Ask Nova..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={() => handleSendMessage()} disabled={!inputText.trim() || isTyping}>
                  ➤
                </button>
              </div>
              <p className="disclaimer">
                Disclaimer: Nova offers support, not medical care. Always consult a professional.
              </p>
            </div>
          </>
        )}

        {activeTab === 'self-care' && renderSelfCarePanel()}
        {activeTab === 'self-tests' && renderSelfTestsPanel()}
        {activeTab === 'counselor' && renderCounselorPanel()}
        {activeTab === 'music' && renderMusicPanel()}
        {activeTab === 'sleep' && renderSleepPanel()}
        {activeTab === 'plan' && renderPlanPanel()}
      </div>
    </div>
  );
}
