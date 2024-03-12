<?php

namespace App\Filament\Admin\Resources\UsersclsResource\Pages;

use App\Filament\Admin\Resources\UsersclsResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUserscls extends ListRecords
{
    protected static string $resource = UsersclsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
