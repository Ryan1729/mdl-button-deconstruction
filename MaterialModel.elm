module MaterialModel exposing (..)

import Material


type alias MaterialModel =
    { mdl : Material.Model }


defaultState =
    { mdl = Material.model }
