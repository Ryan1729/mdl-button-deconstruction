#mdl-button-deconstruction

This is a verion of the uncoloured, raised ripple button from [MDL](getmdl.io), extracted into a standalone javascript and css file combo, with an example html page.

## How?

THis was made through the rather roundabout method of taking a compiled [elm](elm-lang.org) app, (version 0.17) which used [elm-mdl](https://github.com/debois/elm-mdl), a port of MDL to elm., and slowly eliminating unnecessary portions, and rewriting parts in a more compact and less general purpose way. For example, the elm virtual DOM portion could handle arbitrary modifications to the DOM, but I only needed to modify a particular set of DOM nodes in a particular way, so I pruned until the it only did exactly what I wanted, then I even eliminated the virtual part at all and just modified the DOM nodes directly.

## Why?

A few different things prompted this: First, elm 0.18 was released, second, elm-mdl took a long time to be updatred (at the time of this writing it still is not elm 0.18 compatible), third, I had relesed several small projects that had elm-mdl as a dependancy but all I was really using was the fancy ripple button. So, rather than waitingaround I decided to take things into my own hands and extract the button out into a form I would be able to use in the future whether elm-mdl gets forked or updated or not. It almost certainly would have been faster to start from an example of the mdl button that didn't have unrelatedthings like elm's `Task` implementation attached to it, but I was curious about elm's internals and how elm-mdl in particular implemented the ripple.
